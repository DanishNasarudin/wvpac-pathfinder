import { permanentRedirect } from "next/navigation";

export default async function Home() {
  return permanentRedirect("/1");
}
