import React, { Fragment } from 'react';
import moment from 'moment';

const defaultValue = '-';

export default function DateTimeShow({ value = defaultValue }) {
    return (
        <Fragment>
            {value && value !== defaultValue
                ? moment(value).format('YYYY-MM-DD HH:mm:ss')
                : value}
        </Fragment>
    );
}
