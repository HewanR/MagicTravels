import React, { Component } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import Footer from "../footer/footer";
import Login from "../login/login";
import Register from "../register/register";
import Customer from "../customer/customer";
import NavBar from "../navBar/navBar";
import Admin from "../admin/admin";
import Reports from "../reports/reports";
import PageNotFound from "../PageNotFound/PageNotFound";
import Header from "../header/header";
import "./layout.css";

export default class Layout extends Component {
    public hostUrl = "http://localhost";

    public render() {
        return (
            <BrowserRouter>
            <section className="layout">
                
                <nav>
                    <NavBar hostUrl = {this.hostUrl} />
                </nav>

                <header>
                    <Header />
                </header>

                <main>
                    <Switch>
                         <Redirect path="/" to="/home" exact />
                         <Route path="/home" component={() => <Login hostUrl={this.hostUrl} />}  exact />
                         <Route path="/register" component={() => <Register hostUrl={this.hostUrl} />}  exact />
                         <Route path="/customer" component={() => <Customer hostUrl={this.hostUrl} />}  exact />
                         <Route path="/admin" component={() => <Admin hostUrl={this.hostUrl} />}  exact />
                         <Route path="/reports" component={() => <Reports hostUrl={this.hostUrl} />}  exact />
                         <Route component={PageNotFound} />
                    </Switch>
                </main>
                
                <footer>
                    <Footer />
                </footer>
            </section>
            </BrowserRouter>
        );
    }
} 