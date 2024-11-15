import Nav from "@/components/nav/nav";
import Head from "next/head";
import { FormEvent } from "react";

export default function Post() {
  const APIURL =
    "https://4k4mn7f9lj.execute-api.eu-central-1.amazonaws.com/live";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    console.log(event);
    console.log(formData);

    const response = await fetch(`${APIURL}/test`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);
  }

  return (
    <>
      <Head>
        <title>kiikiiworld</title>
      </Head>
      <Nav></Nav>
      <main id="post-form">
        <div className="post-container">
          <form onSubmit={onSubmit} className="form">
            <h2>Add Post</h2>
            <label>
              id
              <input type="text" id="id" />
            </label>
            <label>
              type
              <select name="type" id="type">
                <option value="">--Please choose an option--</option>
                <option value="IMAGE">image</option>
                <option value="QUOTE">quote</option>
                <option value="VIDEO">video</option>
                <option value="STORY">story</option>
              </select>
            </label>
            <label>
              Datetime
              <input type="date" id="type" />
            </label>
            <h2>Content</h2>
            <label>
              title
              <input type="text" id="title" />
            </label>
            <label>
              body
              <input type="text" id="body" />
            </label>
            <label>
              file
              <input type="file" />
            </label>
            <button type="submit">Add Post</button>
          </form>
        </div>
      </main>
    </>
  );
}
