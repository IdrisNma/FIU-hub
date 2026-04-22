import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.dateparse import parse_datetime
from news.tasks import CATEGORY_QUERIES, compute_relevance
from news.models import NewsArticle

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Fetch AML/CFT news articles from NewsAPI for all categories'

    def add_arguments(self, parser):
        parser.add_argument('--category', type=str, default=None,
                            help='Fetch a single category (e.g. sanctions, fatf, general)')

    def handle(self, *args, **options):
        if not settings.NEWS_API_KEY:
            self.stderr.write(self.style.ERROR('NEWS_API_KEY is not set in .env'))
            return

        from newsapi import NewsApiClient
        client = NewsApiClient(api_key=settings.NEWS_API_KEY)

        category = options.get('category')
        queries = {category: CATEGORY_QUERIES[category]} if category and category in CATEGORY_QUERIES else CATEGORY_QUERIES

        total_saved = 0
        for cat, query in queries.items():
            self.stdout.write(f'Fetching {cat}...')
            try:
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
                            'category':        cat,
                            'relevance_score': score,
                        },
                    )
                    if created:
                        saved += 1
                self.stdout.write(self.style.SUCCESS(f'  {cat}: fetched {len(articles)}, saved {saved} new'))
                total_saved += saved
            except Exception as exc:
                self.stderr.write(self.style.ERROR(f'  {cat}: failed — {exc}'))

        self.stdout.write(self.style.SUCCESS(f'\nDone. Total new articles saved: {total_saved}'))
