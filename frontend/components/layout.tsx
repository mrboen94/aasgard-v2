import Footer from "./footer";
import NavBar from "./navbar";

type LayoutProps = {
  children: any;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <div className="print:hidden block">
        <NavBar />
        {children}
        <Footer />
      </div>
      <div className="print:block hidden w-full h-screen m-0 p-0">
        <iframe
          className="w-full h-screen- m-0 p-0"
          src="https://aasgard.netlify.app/"
          title="Web hosted CV"
        />
      </div>
    </>
  );
}
