import logging
from celery import shared_task
from django.conf import settings
from django.utils.dateparse import parse_datetime
from newsapi import NewsApiClient
from .models import NewsArticle

logger = logging.getLogger(__name__)

CATEGORY_QUERIES = {
    'sanctions':    '"sanctions" OR "OFAC" OR "SDN list" OR "UN sanctions" OR "EU sanctions" OR "asset freeze"',
    'fatf':         '"FATF" OR "FSRB" OR "APG" OR "MENAFATF" OR "ESAAMLG" OR "mutual evaluation" OR "FATF plenary"',
    'regulatory':   '"AML regulation" OR "CFT regulation" OR "FinCEN" OR "FINTRAC" OR "financial intelligence unit" OR "compliance directive"',
    'enforcement':  '"money laundering conviction" OR "AML fine" OR "compliance penalty" OR "financial crime prosecution" OR "deferred prosecution"',
    'crypto_aml':   '"crypto AML" OR "virtual asset AML" OR "VASP" OR "cryptocurrency money laundering" OR "DeFi compliance"',
    'typology':     '"money laundering typology" OR "red flag indicators" OR "trade based money laundering" OR "shell company" OR "hawala"',
    'general':      '"anti-money laundering" OR "counter financing terrorism" OR "financial crime" OR "financial intelligence" OR "KYC AML"',
}

RELEVANCE_KEYWORDS = [
    'aml', 'cft', 'money laundering', 'terrorist financing', 'sanctions', 'fatf',
    'fincen', 'ofac', 'compliance', 'financial intelligence', 'financial crime',
    'know your customer', 'kyc', 'suspicious activity', 'shell company', 'hawala',
    'proceeds of crime', 'virtual assets', 'correspondent banking',
]


def compute_relevance(title, description):
    text = f'{title} {description}'.lower()
    return sum(1 for kw in RELEVANCE_KEYWORDS if kw in text)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def fetch_news_for_category(self, category, query):
    if not settings.NEWS_API_KEY:
        logger.warning('NEWS_API_KEY not set — skipping news fetch')
        return
    try:
        client = NewsApiClient(api_key=settings.NEWS_API_KEY)
        response = client.get_everything(q=query, language='en', sort_by='publishedAt', page_size=100)
        articles = response.get('articles', [])
        saved = 0
        for art in articles:
            pub_at = parse_datetime(art.get('publishedAt', ''))
            if not pub_at:
                continue
            score = compute_relevance(art.get('title', ''), art.get('description', ''))
            _, created = NewsArticle.objects.get_or_create(
                url=art.get('url', '')[:1000],
                defaults={
                    'title':           art.get('title', '')[:500],
                    'description':     art.get('description', '') or '',
                    'url_to_image':    (art.get('urlToImage', '') or '')[:1000],
                    'source_name':     art.get('source', {}).get('name', '')[:200],
                    'source_id':       art.get('source', {}).get('id', '') or '',
                    'author':          art.get('author', '') or '',
                    'published_at':    pub_at,
                    'category':        category,
                    'relevance_score': score,
                },
            )
            if created:
                saved += 1
                trigger_alerts_for_article.delay(art.get('title', ''), category)
        logger.info(f'[news] {category}: fetched {len(articles)}, saved {saved} new')
    except Exception as exc:
        logger.error(f'[news] fetch failed for {category}: {exc}')
        raise self.retry(exc=exc)


@shared_task
def trigger_alerts_for_article(title, category):
    from .models import AlertSubscription
    from alerts.models import send_notification
    from django.contrib.auth import get_user_model
    User = get_user_model()
    subs = AlertSubscription.objects.filter(topic=category).select_related('user')
    system_user = User.objects.filter(is_superuser=True).first()
    for sub in subs:
        send_notification(
            actor=system_user,
            recipient=sub.user,
            verb='news_alert',
            description=f'New {category} alert: {title[:200]}',
        )


@shared_task
def fetch_all_news():
    for category, query in CATEGORY_QUERIES.items():
        fetch_news_for_category.delay(category, query)
