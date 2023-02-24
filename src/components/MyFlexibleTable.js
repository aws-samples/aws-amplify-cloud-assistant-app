
// Material Imports
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Paper } from "@mui/material";

const MyFlexibleTable = ({rows, cols, rowIndex}) => {

    return (
        <TableContainer component={Paper} elevation={1}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table" >
                <TableHead >
                    <TableRow>
                        {cols.map((col, index) => (
                            index === 0 ? <TableCell key={index}>{col}</TableCell> : <TableCell align="right" key={index}>{col}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow key={row[rowIndex]} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {row.map((attribute, index) => (
                            index === 0 ? <TableCell scope="row" key={index}>{attribute}</TableCell> : <TableCell align="right" key={index}>{attribute}</TableCell>
                        ))}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default MyFlexibleTable
