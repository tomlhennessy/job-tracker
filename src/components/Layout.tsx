import Header from "./Header";
import Footer from "./Footer"
import { ReactNode } from "react"

interface LayoutProps {
    children: ReactNode;
}


export default function Layout({ children }: LayoutProps) {
    return (
        <div className='flex flex-col min-h-screen'>
            <Header />
            <main className='flex-grow p-4'>{children}</main>
            <Footer />
        </div>
    )
}
