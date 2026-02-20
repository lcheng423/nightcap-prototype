import localFont from "next/font/local";
import "./globals.css";
import IosCursorProvider from "./IosCursorProvider";

const dinRounded = localFont({
  src: "./font/DIN2014RoundedVF-Regular.ttf",
  variable: "--font-din-rounded",
  display: "swap",
});

export const metadata = {
  title: "Nightcap",
  description: "Nightcap prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dinRounded.variable} ${dinRounded.className} antialiased`}>
        <IosCursorProvider>
          {children}
        </IosCursorProvider>
      </body>
    </html>
  );
}
