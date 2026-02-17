import localFont from "next/font/local";
import "./globals.css";
import IosCursorProvider from "./IosCursorProvider";

const dinRounded = localFont({
  src: "./font/DIN2014RoundedVF-Regular.ttf",
  variable: "--font-din-rounded",
  display: "swap",
});

export const metadata = {
  title: "Reflection flow prototype",
  description: "Reflection flow prototype",
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
