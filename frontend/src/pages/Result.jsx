import React from "react";

const Result = ({ name, marks }) => {
    return (
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>Name:</td>
                        <td>{name}</td>
                        <td>Marks:</td>
                        <td>{marks}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Result;
