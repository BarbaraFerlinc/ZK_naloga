import { React, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";
import Index from "views/Index.js";
import Login from "views/auth/Login";
import ObjavaOglasa from "views/ObjavaOglasa";
import Profile from "views/Profile";
import Register from "views/auth/Register";
import api from "services/api";
import Podrobnosti from "views/Podrobnosti";
import { AuthContextProvider } from "context/AuthContext";
import ProdajalecProfil from "views/ProdajalecProfil";
import Zamenjava from "views/Zamenjava";
import Nakup from "views/Nakup";
import PrivateRouting from "./PrivateRouting";
import UrejanjeOglasa from "views/UrejanjeOglasa";
import PodrobnostiZamenjanega from "views/PodrobnostiZamenjanega";
import Obvestilo from "views/Obvestila";
import PodrobnostiObvestila from "views/PodrobnostiObvestila";
import PodrobnostiObvestilaNakupa from "views/podrobnostiObvestilaNakupa";
import About from "views/About";

const Routing = () => {
    const [seznam, setSeznam] = useState([]);
    const [seznamZamenjanih, setSeznamZamenjanih] = useState([]);

    const fetchArtikle = async () => {
        try {
            const response = await api.get('/artikel/vsi');
            setSeznam(response.data);
        } catch (error) {
            console.error("Napaka pri pridobivanju oglasov", error);
        }
    };

    useEffect(() => {
        const fetchZamenjani = async () => {
            try {
                const response = await api.get('/zamenjava/vsi');
                setSeznamZamenjanih(response.data);
            } catch (error) {
                console.error("Napaka pri pridobivanju oglasov", error);
            }
        };

        fetchArtikle();
        fetchZamenjani();
    }, []);

    const handleAdd = () => {
        fetchArtikle();
    }

    const handleEdit = () => {
        fetchArtikle();
    }

    const handleDelete = () => {
        fetchArtikle();
    }

    const izbris = (id) => {
        fetchArtikle();
    };

    return (<>
        <AuthContextProvider>
            <Routes>
                <Route path="/" element={<Index seznamOglasov={seznam} />} />
                <Route path="/about" element={<About></About>}/>
                <Route path="/oglas/:id" element={<Podrobnosti izbris={handleDelete} />} />
                <Route path="/login" element={<div className="bg-blueGray-200 min-h-screen"><Login /></div>} />
                <Route path="/register" element={<div className="bg-blueGray-200 min-h-screen"><Register /></div>} />
                <Route path="/prodajalec/:id" element={<ProdajalecProfil />} />
                <Route path="" element={<PrivateRouting />}>
                    <Route path="/objavaOglasa" element={<div className="bg-blueGray-200 min-h-screen"><ObjavaOglasa dodaj={handleAdd} /></div>} />
                    <Route path="/profile" element={<Profile izbris={izbris} />} />
                    <Route path="/urejanje-oglasa/:id" element={<div className="bg-blueGray-200 min-h-screen"><UrejanjeOglasa seznamOglasov={seznam} onEdit={handleEdit} /></div>} />
                    <Route path="/zamenjava/:id" element={<div className="bg-blueGray-200 min-h-screen"> <Zamenjava /> </div>} />
                    <Route path="/nakup/:id" element={<div className="bg-blueGray-200 min-h-screen"> <Nakup izbris={handleDelete} /> </div>} />
                    <Route path="/oglas-zamenjan/:id" element={<PodrobnostiZamenjanega izbris={handleDelete} />} />
                    <Route path="/obvestila" element={<Obvestilo></Obvestilo>}></Route>
                    <Route path="/obvestilo/:id" element={<PodrobnostiObvestila />} />
                    <Route path="/obvestilo-nakupa/:id" element={<PodrobnostiObvestilaNakupa />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthContextProvider>
    </>
    );
}

export default Routing;