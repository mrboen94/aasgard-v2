import NavBar from "./navbar";

type LayoutProps = {
  children: any;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
