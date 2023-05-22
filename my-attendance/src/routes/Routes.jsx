import { Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ContentPage from "../pages/ContentPage";
import LogPage from "../pages/LogPage";
import ForgetPage from "../pages/ForgetPage";

const routes = [
	<Route path="/" element={<ContentPage />}></Route>,
	<Route path="/login" element={<LoginPage />}></Route>,
	<Route path="/register" element={<RegisterPage />}></Route>,
	<Route path="/log" element={<LogPage />}></Route>,
	<Route path="/forget" element={<ForgetPage />}></Route>,
];

export default routes;
