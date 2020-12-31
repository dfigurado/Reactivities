import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import { createBrowserHistory } from 'history'
import App from "./app/layout/App";
import * as serviceWorker from "./serviceWorker";
import ScrollToTop from '../src/app/layout/ScrollToTop';
import 'react-toastify/dist/ReactToastify.min.css';
import 'react-widgets/dist/css/react-widgets.css';

import dateFnsLocalizer from 'react-widgets-date-fns';

new dateFnsLocalizer();

export const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <ScrollToTop>
      <App />
    </ScrollToTop>
  </Router>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
serviceWorker.unregister();
