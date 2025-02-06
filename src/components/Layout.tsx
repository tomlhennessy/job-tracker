import Footer from "./Footer"
import { ReactNode } from "react"
import Navbar from "./Navbar";

interface LayoutProps {
    children: ReactNode;
}


export default function Layout({ children }: LayoutProps) {
    return (
        <div className='flex flex-col min-h-screen'>
            <Navbar />
            <main className='flex-grow p-4'>{children}</main>
            <Footer />
        </div>
    )
}
