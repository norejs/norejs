import { useRef, forwardRef, useImperativeHandle,Fragment } from "react";
import Table from "../Table";
import Top from "../Top";
import Search from "../Search";
/**
 * 通用页面组件
 */

function Page(
    {
        table = {},
        topButtons = undefined,
        searchBar = undefined,
        children = null,
        mock = false,
        inputRender,
        ...props
    },
    ref,
) {
    const tableRef = useRef();
    const { structure = [] } = table;
    useImperativeHandle(ref, () => {
        return { table: tableRef };
    });
    return (
        <Fragment>
            {/* <Top
                topButtons={topButtons}
                table={table}
                onAddClick={() => {
                    tableRef.current.createHandle();
                }}
            /> */}

            {searchBar || (
                <Search
                    onSearch={(data) => {
                        tableRef.current.search(data);
                    }}
                    inputRender={inputRender}
                    structure={structure}
                />
            )}
            <Table
                topButtons={topButtons}
                ref={tableRef}
                inputRender={inputRender}
                table={table}
                {...props}
            />
        </Fragment>
    );
}
export default forwardRef(Page);
