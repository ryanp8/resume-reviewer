"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";
import { KeywordGraph } from "@/components/KeywordGraph";
import { CiCirclePlus } from "react-icons/ci";
import fetchWithTokenRetry from "@/app/utils/fetch";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { JobListingForm } from "@/components/JobListingForm";
import { ThreeDots } from "react-loader-spinner";


export default function User() {
  const authContext = React.useContext(AuthContext);
  const inputFile = React.useRef(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [filename, setFilename] = React.useState("");
  const [resumes, setResumes] = React.useState({});
  const [loadingResumes, setLoadingResumes] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [jobListing, setJobListing] = React.useState("");
  const [selectedResume, setSelectedResume] = React.useState("");
  const [similarity, setSimilarity] = React.useState<number | null>(null);
  const [loadingSimilarity, setLoadingSimilarity] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    (async function () {
      setLoadingResumes(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetchWithTokenRetry(
        `${process.env.NEXT_PUBLIC_BASE_URL}/resumes`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const json = await response.json();
      setResumes(json);
      setLoadingResumes(false);
    })();
  }, []);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onSubmit = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.push("/login");
      return;
    }
    if (file) {
      setUploading(true);
      console.log("submitting");
      const fileData = await convertToBase64(file);
      await fetchWithTokenRetry(`${process.env.NEXT_PUBLIC_BASE_URL}/resumes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          filename: file.name,
          data: fileData.slice(28),
        }),
      });
      setResumes({ ...resumes, [file.name]: fileData });
      setFile(null);
      setFilename("");
      setUploading(false);
    }
  };

  const submitJobListing = async () => {
    if (!jobListing) {
      return;
    }
    if (!selectedResume) {
      alert("Select a resume");
      return;
    }

    setLoadingSimilarity(true);
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetchWithTokenRetry(
      `${process.env.NEXT_PUBLIC_BASE_URL}/comparison?resume_id=${selectedResume}&job_text=${jobListing}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const json = await response.json();
    setLoadingSimilarity(false);
    setSimilarity(json.result);
    console.log(json);
  };
  return (
    <main className="mx-24">
      <div className="my-12 flex">
        <div className="w-1/2 mx-4">
          <input
            type="file"
            id="file"
            ref={inputFile}
            className="hidden"
            onChange={onSelectFile}
          />
          <h3>
            Your resumes{" "}
            <span>
              <CiCirclePlus
                className="inline cursor-pointer"
                size={16}
                onClick={(e) => {
                  if (inputFile && inputFile.current)
                    (inputFile.current as any).click();
                }}
              />
            </span>
          </h3>
          {filename && file && (
            <>
              {!uploading ? (
                <div className="my-3">
                  <p>
                    Selected:{" "}
                    <span className="text-sm text-gray-600">{filename}</span>
                  </p>
                  <div className="my-1">
                    <button
                      className="rounded-md text-sm px-4 py-2 bg-purple-500 text-white"
                      onClick={onSubmit}
                    >
                      Upload
                    </button>
                    <button
                      className="text-sm text-red-500 ml-5"
                      onClick={() => {
                        setFile(null);
                        setFilename("");
                        setUploading(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>Uploading...</p>
              )}
            </>
          )}
          {loadingResumes && <ThreeDots />}
          {Object.entries(resumes).map((entry, idx) => {
            const id = entry[0];
            const data = entry[1] as any;
            return (
              <div
                key={idx}
                className={`rounded-md p-2 cursor-pointer ${
                  selectedResume == id && "border-2 border-violet-500"
                }`}
                onClick={() => {
                  setSelectedResume(id);
                }}
              >
                <p>{data.filename}</p>
                <object width="100%" height={400} data={`data:application/pdf;base64,${data.datastr as string}`}></object>
              </div>
            );
          })}
        </div>
        <div className="w-1/2 mx-4">
          <h3>Job Listing</h3>
          <JobListingForm
            setJobListing={setJobListing}
            submitJobListing={submitJobListing}
          />
          <div className="my-5">
            <h4>Cosine Similarity</h4>
            {loadingSimilarity && <ThreeDots width={50} height={25} />}
            {similarity != null && !loadingSimilarity && (
              <h4>Result: {similarity}</h4>
            )}
            <p className="text-gray-500">
              This score is calculated by aggregating the words in your resume
              and the words in the job description. The cosine similarity is
              then computed on the vectors of the frequencies of the words in
              each file. The score is between 0 and 1, with scores closer to 1
              meaning that the two files are very similar.
            </p>
          </div>
        </div>
      </div>
      <KeywordGraph />
    </main>
  );
}
