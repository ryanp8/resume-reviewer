import * as React from "react";

export function JobListingForm({
  submitJobListing,
  setJobListing,
}: {
  submitJobListing: React.MouseEventHandler<HTMLButtonElement>;
  setJobListing: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div>
      <label
        htmlFor="message"
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        Paste the text from a job listing here
      </label>
      <textarea
        id="message"
        rows={12}
        className="w-full border-2 p-2 focus:border-red-500 text-sm font-light"
        placeholder="Paste here"
        onChange={(e) => {
          setJobListing(e.target.value);
        }}
      ></textarea>
      <button className="my-3 bg-violet-500 rounded-md px-4 py-2 text-white" onClick={submitJobListing}>
        Submit
      </button>
    </div>
  );
}
