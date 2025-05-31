// HomePage.jsx
import Form from "./Form";
import Query from "./Query";
import Slider from "./Slider";
import Nave from "../Pages/Nave";
import FaqSlider from "./FaqSlider";
import Sfooter from "../public/Sfooter";

export default function HomePage() {
  return (
    <>
      <Nave />
      <Slider />
      <Query />
      <FaqSlider />
      <Form />
      <Sfooter />
    </>
  );
}