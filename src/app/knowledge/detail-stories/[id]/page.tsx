import React from "react";
import { SavedProvider } from "../../../../components/learninghub/Saved/SavedContext";
import StoryDetail from "../../../../components/learninghub/detail/StoryDetail";

const page = () => {
  return (
    <div>
      <SavedProvider>
        <StoryDetail />
      </SavedProvider>
    </div>
  );
};

export default page;
