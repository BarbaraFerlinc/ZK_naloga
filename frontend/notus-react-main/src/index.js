import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/styles/tailwind.css";
import Routing from "components/Routing/Routing";

ReactDOM.render(
  <BrowserRouter>
    <Routing />
  </BrowserRouter>,
  document.getElementById("root")
);
