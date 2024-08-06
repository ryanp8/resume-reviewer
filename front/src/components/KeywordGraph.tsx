import * as React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { ThreeDots } from "react-loader-spinner";

export function KeywordGraph() {
  const [wordFreqs, setWordFreqs] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async function () {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/keywords`);
      const json = await response.json();
      setWordFreqs(json);
      setLoading(false);
    })();
  }, []);
  return (
    <div className="flex justify-center">
      {loading ? (
        <ThreeDots />
      ) : (
        <div>
          <p className="text-center">
            Keyword frequencies from SWE intern listings this week.
          </p>
          {wordFreqs && (
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: Object.keys(wordFreqs),
                  tickLabelStyle: {
                    angle: -75,
                    textAnchor: "end",
                    fontSize: 8,
                  },
                },
              ]}
              series={[{ data: Object.values(wordFreqs) }]}
              width={1200}
              height={400}
            />
          )}
        </div>
      )}
    </div>
  );
}
