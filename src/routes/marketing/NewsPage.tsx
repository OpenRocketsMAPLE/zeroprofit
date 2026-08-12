import { NEWS } from '../../lib/content';
import { fmtDate } from '../../lib/format';
import { Chip } from '../../components/ui/Chip';

export function NewsPage() {
  return (
    <div className="public-frame">
      <div className="eyebrow" style={{ marginTop: 48 }}>
        Newsroom
      </div>
      <h1>ZeroProfit news.</h1>
      <div className="stack" style={{ marginTop: 24, maxWidth: 720 }}>
        {NEWS.map((post) => (
          <article className="panel" key={post.title}>
            <div className="row row--between" style={{ marginBottom: 8 }}>
              <Chip tone="rust">{post.tag}</Chip>
              <span className="small muted">{fmtDate(post.date)}</span>
            </div>
            <h2 style={{ margin: '0 0 8px' }}>{post.title}</h2>
            <p className="muted" style={{ margin: 0 }}>{post.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
