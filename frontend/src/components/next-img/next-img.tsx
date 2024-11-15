import styles from "./next-img.module.scss"
import Link from "next/link";
import Image from "next/image";

interface ImgProps {
  image :string,
  width: number,
  height: number,
  alt: string,
}

function getImageUrl(id: string): string {
  return `/blog/${id}`
}

export default function NextImg({image, width, height, alt}: ImgProps) {
  return (
    <Link href={getImageUrl(image)} className={styles.nextImgLink}>
          <Image src={getImageUrl(image)}
          className={styles.nextImg}
          alt={alt}
          height={width}
          width={height}>
          </Image>
     </Link>
  );
}