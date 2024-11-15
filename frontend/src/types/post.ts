export default interface BasePost {
    slug: string,
    slugAsParams: string,
    category: string,
    title: string,
    date: string,
    video?: string,
    image?: string,
    quote?: string,
    description?: string,
    body: string,
  }
