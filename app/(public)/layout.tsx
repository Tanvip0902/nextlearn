import { Navbar } from "./_components/Navbar"

import { ReactNode } from "react"


const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 lg:px-8 mb-32">
        {children}
      </main>
   
    </div>
  )
}

export default Layout