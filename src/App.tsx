import "./App.css";

import WithCSSModules from "./examples/with-css-modules";
// import WithCustomTags from "./examples/with-custom-tags";
// import WithTailwind from "./examples/with-tailwind";

function App() {
  return (
    <div className="max-w-7xl mx-auto py-10 px-8">
      <div className="mt-4">
        <WithCSSModules />
      </div>
    </div>
  );
}

export default App;
