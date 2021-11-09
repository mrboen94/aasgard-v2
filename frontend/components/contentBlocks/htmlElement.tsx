export default function HtmlElement({ data }: any) {
  return <div dangerouslySetInnerHTML={{ __html: data }} />;
}
