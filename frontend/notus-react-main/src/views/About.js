import React from "react";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer";
import { Link } from "react-router-dom";

const About = () => {
    return (
        <>
            <IndexNavbar></IndexNavbar>
            <main>
                <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
                    <div
                        className="absolute top-0 w-full h-full bg-center bg-cover"
                        style={{
                            backgroundImage:
                                "url('https://images.pexels.com/photos/5896/vintage-sweater-retro-wool.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
                        }}
                    >
                        <span
                            id="blackOverlay"
                            className="w-full h-full absolute opacity-50 bg-black"
                        ></span>
                    </div>
                    <div className="container relative mx-auto">
                        <div className="items-center flex flex-wrap">
                            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                                <div className="pr-12">
                                    <h1 className="text-white font-semibold text-5xl">
                                        ReCloth
                                    </h1>
                                    <p className="mt-4 text-lg text-blueGray-200">
                                        Odkrijte svet rabljenih oblačil na naši inovativni spletni aplikaciji! 
                                        Pridružite se rastoči skupnosti prodajalcev in kupcev ter uživajte v enostavnem, varnem in 
                                        zanesljivem načinu izmenjave in prodaje oblačil.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
                        style={{ transform: "translateZ(0)" }}
                    >
                        <svg
                            className="absolute bottom-0 overflow-hidden"
                            xmlns="http://www.w3.org/2000/svg"
                            preserveAspectRatio="none"
                            version="1.1"
                            viewBox="0 0 2560 100"
                            x="0"
                            y="0"
                        >
                            <polygon
                                className="text-blueGray-200 fill-current"
                                points="2560 0 2560 100 0 100"
                            ></polygon>
                        </svg>
                    </div>
                </div>
                <section className="pb-10 bg-blueGray-200 -mt-24">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap">
                            <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                                    <div className="px-4 py-5 flex-auto">
                                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-red-400">
                                            <i className="fas fa-award"></i>
                                        </div>
                                        <h6 className="text-xl font-semibold">Osveži svojo garderobo!</h6>
                                        <p className="mt-2 mb-4 text-blueGray-500">
                                            Odkrij našo spletno aplikacijo in osveži svojo garderobo s preprostim klikom.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-4/12 px-4 text-center">
                                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                                    <div className="px-4 py-5 flex-auto">
                                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-lightBlue-400">
                                            <i className="fas fa-retweet"></i>
                                        </div>
                                        <h6 className="text-xl font-semibold">Odkrij, zamenjaj, izstopaj!</h6>
                                        <p className="mt-2 mb-4 text-blueGray-500">
                                            Odkrij našo edinstveno spletno aplikacijo, kjer lahko zamenjaš svoja oblačila in izstopaš s svojim unikatnim stilom.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 w-full md:w-4/12 px-4 text-center">
                                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                                    <div className="px-4 py-5 flex-auto">
                                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-emerald-400">
                                            <i className="fas fa-fingerprint"></i>
                                        </div>
                                        <h6 className="text-xl font-semibold">Obleci se drugače, brez zapravljanja!</h6>
                                        <p className="mt-2 mb-4 text-blueGray-500">
                                            Odkrij našo edinstveno spletno aplikacijo, ki ti omogoča, da se oblečeš drugače, brez občutka, da zapravljaš v prazno!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>
            <Footer></Footer>
        </>
    )
}

export default About;