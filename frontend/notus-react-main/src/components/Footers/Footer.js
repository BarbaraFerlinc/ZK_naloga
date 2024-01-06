import React from "react";

export default function Footer() {
  return (
    <footer className="relative bg-blueGray-200 pt-4 pb-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="mt-6">
            <button
              className="bg-white text-lightBlue-400 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
              type="button"
            >
              <i className="fab fa-twitter"></i>
            </button>
            <button
              className="bg-white text-lightBlue-600 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
              type="button"
            >
              <i className="fab fa-facebook-square"></i>
            </button>
            <button
              className="bg-white text-pink-400 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
              type="button"
            >
              <i className="fab fa-dribbble"></i>
            </button>
            <button
              className="bg-white text-blueGray-800 shadow-lg font-normal h-8 w-8 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
              type="button"
            >
              <i className="fab fa-github"></i>
            </button>
          </div>
        </div>
        <hr className="my-2 border-blueGray-300" />
        <div className="flex justify-center">
          <div className="text-xs text-blueGray-500">
            © {new Date().getFullYear()} ReCloth. Vse pravice pridržane.
          </div>
        </div>
      </div>
    </footer>
  );
}
