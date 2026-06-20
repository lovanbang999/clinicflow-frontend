import type { JsonLdObject } from '@/lib/seo/json-ld';

type JsonLdProps = {
  data?: JsonLdObject;
};

export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
