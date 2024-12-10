/**
 * Copyright (c) 2022 Nxpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

import FeedbackComponent from "../feedback-form/FeedbackComponent";
import { isNxpodIo } from "../utils";
import Alert from "./Alert";

function ErrorMessage(props: { imgSrc: string; imgAlt?: string; message: string }) {
    return (
        <>
            <div className="mt-16 w-96">
                <Alert closable={false} showIcon={true} type="error">
                    {props.message}
                </Alert>
            </div>
            {isNxpodIo() && (
                <FeedbackComponent
                    message={"Was this error message helpful?"}
                    initialSize={24}
                    isError={true}
                    isModal={false}
                    errorMessage={props.message}
                />
            )}
        </>
    );
}

export default ErrorMessage;
