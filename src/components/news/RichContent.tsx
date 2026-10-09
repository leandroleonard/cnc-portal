import Image from 'next/image';
import type { RichTextBlock } from '@/types/domain';

export function RichContent({ blocks }: { blocks: RichTextBlock[] }) {
  return <div className="article-body">{blocks.map((block, index) => {
    const key = `${block.type}-${index}`;
    switch (block.type) {
      case 'paragraph': return <p key={key}>{block.text}</p>;
      case 'heading': return block.level === 2 ? <h2 key={key}>{block.text}</h2> : <h3 key={key}>{block.text}</h3>;
      case 'quote': return <blockquote key={key}>{block.text}{block.attribution && <cite>{block.attribution}</cite>}</blockquote>;
      case 'list': {
        const List = block.ordered ? 'ol' : 'ul';
        return <List key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</List>;
      }
      case 'image': return <figure className="rich-image" key={key}><Image src={block.media.url} alt={block.media.altText ?? ''} width={block.media.width ?? 1200} height={block.media.height ?? 800} sizes="(max-width: 768px) 100vw, 800px" /><figcaption>{block.caption ?? block.media.caption}</figcaption></figure>;
    }
  })}</div>;
}
