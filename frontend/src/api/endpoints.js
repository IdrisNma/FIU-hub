import api from './client'

export const authApi = {
  register:      (data)   => api.post('/auth/register/', data),
  login:         (data)   => api.post('/auth/login/', data),
  logout:        (data)   => api.post('/auth/logout/', data),
  refreshToken:  (data)   => api.post('/auth/token/refresh/', data),
  getMe:         ()       => api.get('/auth/me/'),
  updateMe:      (data)   => api.patch('/auth/me/', data),
  requestVerify: ()       => api.post('/auth/me/request-verification/'),
}

export const usersApi = {
  list:      (params) => api.get('/profiles/', { params }),
  getProfile:(username) => api.get(`/profiles/${username}/`),
  follow:    (username) => api.post(`/profiles/${username}/follow/`),
  unfollow:  (username) => api.delete(`/profiles/${username}/follow/`),
  followers: (username) => api.get(`/profiles/${username}/followers/`),
  following: (username) => api.get(`/profiles/${username}/following/`),
}

export const profileApi = usersApi  // backward-compat alias

export const postsApi = {
  feed:          (params) => api.get('/posts/feed/', { params }),
  publicFeed:    (params) => api.get('/posts/public/', { params }),
  getUserPosts:  (username) => api.get('/posts/public/', { params: { author: username } }),
  create:        (data)   => api.post('/posts/create/', data),
  get:           (id)     => api.get(`/posts/${id}/`),
  update:        (id, d)  => api.patch(`/posts/${id}/`, d),
  delete:        (id)     => api.delete(`/posts/${id}/`),
  like:          (id)     => api.post(`/posts/${id}/like/`),
  unlike:        (id)     => api.delete(`/posts/${id}/like/`),
  getComments:   (id)     => api.get(`/posts/${id}/comments/`),
  addComment:    (id, d)  => api.post(`/posts/${id}/comments/`, d),
  bookmark:      (id)     => api.post(`/posts/${id}/bookmark/`),
  unbookmark:    (id)     => api.delete(`/posts/${id}/bookmark/`),
  bookmarked:    ()       => api.get('/posts/bookmarked/'),
  report:        (id, d)  => api.post(`/posts/${id}/report/`, d),
  trendingTags:  ()       => api.get('/posts/trending-tags/'),
}

export const newsApi = {
  list:           (params) => api.get('/news/', { params }),
  get:            (id)     => api.get(`/news/${id}/`),
  saveArticle:    (id)     => api.post(`/news/${id}/save/`),
  unsaveArticle:  (id)     => api.delete(`/news/${id}/save/`),
  saved:          ()       => api.get('/news/saved/'),
  getAlerts:      ()       => api.get('/news/alerts/'),
  createAlert:    (d)      => api.post('/news/alerts/', d),
  deleteAlert:    (id)     => api.delete(`/news/alerts/${id}/`),
}

export const notificationsApi = {
  list:      ()   => api.get('/alerts/notifications/'),
  markRead:  ()   => api.post('/alerts/notifications/mark-read/'),
  count:     ()   => api.get('/alerts/notifications/count/'),
}

export const typologiesApi = {
  list:    (params) => api.get('/typologies/', { params }),
  get:     (id)     => api.get(`/typologies/${id}/`),
  create:  (d)      => api.post('/typologies/', d),
  update:  (id, d)  => api.patch(`/typologies/${id}/`, d),
  vote:    (id)     => api.post(`/typologies/${id}/vote/`),
  unvote:  (id)     => api.delete(`/typologies/${id}/vote/`),
}

export const qaApi = {
  list:          (params) => api.get('/qa/', { params }),
  get:           (id)     => api.get(`/qa/${id}/`),
  create:        (d)      => api.post('/qa/', d),
  addAnswer:     (id, d)  => api.post(`/qa/${id}/answers/`, d),
  acceptAnswer:  (qId, aId) => api.post(`/qa/${qId}/answers/${aId}/accept/`),
  voteAnswer:    (aId, val) => api.post(`/qa/answers/${aId}/vote/`, { value: val }),
}

export const groupsApi = {
  list:   (params) => api.get('/groups/', { params }),
  get:    (slug)   => api.get(`/groups/${slug}/`),
  create: (d)      => api.post('/groups/', d),
  join:   (slug)   => api.post(`/groups/${slug}/join/`),
  leave:  (slug)   => api.delete(`/groups/${slug}/join/`),
}

export const eventsApi = {
  list:   (params) => api.get('/events/', { params }),
  get:    (id)     => api.get(`/events/${id}/`),
  create: (d)      => api.post('/events/', d),
}

export const jurisdictionsApi = {
  list: (params)    => api.get('/countries/', { params }),
  get:  (isoCode)   => api.get(`/countries/${isoCode}/`),
}
