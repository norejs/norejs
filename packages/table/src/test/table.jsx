import React from "react";
import { registerTable } from "../modules/table";
import Table from "../components/Table";
export default function TableTest() {
    const table = registerTable({
        name: "table1",
        structure: [{
            
        }],
    });
    return (
        <Fragment>
            <h2>Table1</h2>
            <Table table={table} />
        </Fragment>
    );
}
