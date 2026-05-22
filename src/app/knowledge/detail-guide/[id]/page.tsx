import React from "react";
import { SavedProvider } from "../../../../components/learninghub/Saved/SavedContext";
import GuideDetail from "../../../../components/learninghub/detail/GuideDetail";

const page = () => {
  return (
    <div>
      <SavedProvider>
        <GuideDetail />
      </SavedProvider>
    </div>
  );
};

export default page;
