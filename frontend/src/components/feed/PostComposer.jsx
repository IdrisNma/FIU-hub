import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useRef, useState } from 'react'
import { postsApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'

const POST_TYPES = [
  { value: 'discussion',     label: 'Discussion' },
  { value: 'typology',       label: 'Typology' },
  { value: 'regulatory',     label: 'Regulatory Update' },
  { value: 'case_study',     label: 'Case Study' },
  { value: 'question',       label: 'Question' },
]

const VISIBILITY = [
  { value: 'public',         label: 'Public' },
  { value: 'followers',      label: 'Followers only' },
  { value: 'verified_only',  label: 'Verified members' },
]

const iconBtn = (active) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
  background: active ? 'rgba(37,99,235,0.18)' : 'transparent',
  color: active ? '#60a5fa' : 'var(--text-secondary)',
  transition: 'background 0.15s, color 0.15s',
})

export default function PostComposer({ onCreated }) {
  const { user } = useAuthStore()
  const [postType,    setPostType]    = useState('discussion')
  const [visibility,  setVisibility]  = useState('public')
  const [tagInput,    setTagInput]    = useState('')
  const [tags,        setTags]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [imageFile,   setImageFile]   = useState(null)
  const [imagePreview,setImagePreview]= useState(null)
  const [showLink,    setShowLink]    = useState(false)
  const [linkUrl,     setLinkUrl]     = useState('')
  const fileRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "What's on your mind? Share intelligence, a case study…" }),
    ],
    editorProps: {
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] p-3' },
    },
  })

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().toLowerCase().replace(/\s+/g, '_')
      if (!tags.includes(t)) setTags(prev => [...prev, t])
      setTagInput('')
    }
  }
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t))

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }
  const removeImage = () => {
    setImageFile(null)
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null) }
  }

  const handleSubmit = async () => {
    const html = editor?.getHTML() || ''
    if (html === '<p></p>' || !html.trim()) { setError('Please write something.'); return }
    setLoading(true); setError(null)
    try {
      let payload
      if (imageFile) {
        payload = new FormData()
        payload.append('content', html)
        payload.append('post_type', postType)
        payload.append('visibility', visibility)
        tags.forEach(t => payload.append('tags', t))
        payload.append('image', imageFile)
        if (linkUrl.trim()) payload.append('link_url', linkUrl.trim())
      } else {
        payload = { content: html, post_type: postType, visibility, tags }
        if (linkUrl.trim()) payload.link_url = linkUrl.trim()
      }
      const { data } = await postsApi.create(payload)
      editor.commands.clearContent()
      setTags([]); setTagInput(''); setLinkUrl(''); setShowLink(false)
      removeImage()
      onCreated?.(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?'

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '16px 18px', marginBottom: 4 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Avatar */}
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
          {user?.profile?.avatar
            ? <img src={user.profile.avatar} alt={initials} style={{ width: 36, height: 36, objectFit: 'cover' }} />
            : initials}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Rich text editor */}
          <div style={{ border: '1px solid var(--card-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--card-bg)' }}>
            {/* Format toolbar */}
            <div style={{ display: 'flex', gap: 4, padding: '5px 8px', borderBottom: '1px solid var(--divider)', background: 'var(--toolbar-bg)' }}>
              {[
                { cmd: () => editor?.chain().focus().toggleBold().run(),       label: 'B',   active: editor?.isActive('bold') },
                { cmd: () => editor?.chain().focus().toggleItalic().run(),     label: 'I',   active: editor?.isActive('italic') },
                { cmd: () => editor?.chain().focus().toggleBulletList().run(), label: '≡',   active: editor?.isActive('bulletList') },
                { cmd: () => editor?.chain().focus().toggleCodeBlock().run(),  label: '</>',  active: editor?.isActive('codeBlock') },
              ].map(({ cmd, label, active }) => (
                <button key={label} type="button" onClick={cmd} style={{
                  padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'monospace', fontWeight: 700,
                  background: active ? 'rgba(37,99,235,0.25)' : 'transparent',
                  color: active ? '#93c5fd' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}>{label}</button>
              ))}
            </div>
            <EditorContent editor={editor} />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div style={{ position: 'relative', display: 'inline-block', alignSelf: 'flex-start' }}>
              <img src={imagePreview} alt="Preview" style={{ maxHeight: 220, maxWidth: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover', display: 'block' }} />
              <button type="button" onClick={removeImage} style={{
                position: 'absolute', top: 6, right: 6,
                width: 22, height: 22, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(0,0,0,0.7)', color: '#e2e8f0', fontSize: 14, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>
          )}

          {/* Link input */}
          {showLink && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                style={{
                  flex: 1, background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  borderRadius: 8, padding: '7px 12px', color: 'var(--text-primary)', fontSize: 12, outline: 'none',
                }}
              />
              <button type="button" onClick={() => { setShowLink(false); setLinkUrl('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {tags.map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(37,99,235,0.12)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.25)', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>
                #{t}
                <button type="button" onClick={() => removeTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
            <input
              style={{ fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-secondary)', flex: 1, minWidth: 120 }}
              placeholder="Add tags (Enter)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
          </div>

          {error && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>}

          {/* Bottom bar: media icons + selects + Post button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--divider)', paddingTop: 10 }}>
            {/* Hidden file input */}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

            {/* Photo */}
            <button type="button" title="Add photo" onClick={() => fileRef.current?.click()} style={iconBtn(!!imageFile)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Link */}
            <button type="button" title="Add link" onClick={() => setShowLink(v => !v)} style={iconBtn(showLink || !!linkUrl)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>

            {/* GIF (UI only) */}
            <button type="button" title="GIF (coming soon)" style={iconBtn(false)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.8} strokeLinecap="round" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12H6v-1.5A1.5 1.5 0 017.5 9v0A1.5 1.5 0 019 10.5V12h-1M12 9v6M15 9h2.5M15 12h2M15 15h2.5" />
              </svg>
            </button>

            {/* Emoji (native picker) */}
            <button type="button" title="Emoji" onClick={() => editor?.chain().focus().run()} style={iconBtn(false)}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.5 14s1.5 2 3.5 2 3.5-2 3.5-2M9 9.5h.01M15 9.5h.01" />
              </svg>
            </button>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Type & visibility selects */}
            <select value={postType} onChange={e => setPostType(e.target.value)} className="input" style={{ fontSize: 11, padding: '5px 8px', width: 'auto' }}>
              {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select value={visibility} onChange={e => setVisibility(e.target.value)} className="input" style={{ fontSize: 11, padding: '5px 8px', width: 'auto' }}>
              {VISIBILITY.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>

            <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ fontSize: 13, padding: '7px 20px', flexShrink: 0 }}>
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
