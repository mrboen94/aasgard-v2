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
      <div className="print:block hidden">
        <iframe src="https://aasgard.netlify.app/" />
      </div>
    </>
  );
}
