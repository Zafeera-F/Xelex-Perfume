import Hero from "../components/home/Hero";
import FeaturedCollection from "../components/home/FeaturedCollection";
import BestSellers from "../components/home/BestSellers";
import StorySection from "../components/home/StorySection";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import Newsletter from "../components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <BestSellers />
      <StorySection />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}