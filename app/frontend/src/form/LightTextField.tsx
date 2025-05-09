
import "./LightTextField.scss"


// TODO: work in progress to replicate material-ui's `TextField` component but without all
// the proliferation of `<style>` tags that get injected synchronously into the DOM and
// that significantly degrade performance

export function ListTextField ()
{
    return <div class="MuiFormControl-root MuiTextField-root MuiFormControl-fullWidth">
        <label
            class="MuiFormLabel-root MuiInputLabel-root MuiInputLabel-formControl MuiInputLabel-animated MuiInputLabel-shrink MuiInputLabel-marginDense MuiInputLabel-outlined MuiFormLabel-filled" data-shrink="true"
        >
            Expected datetime
        </label>
        <div
            class="MuiInputBase-root MuiOutlinedInput-root MuiInputBase-fullWidth MuiInputBase-formControl MuiInputBase-marginDense MuiOutlinedInput-marginDense"
        >
            <input
                aria-invalid="false"
                type="text"
                class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputMarginDense MuiOutlinedInput-inputMarginDense"
            />
            <fieldset
                aria-hidden="true"
                class="hardcoded-PrivateNotchedOutline-root-67 hardcoded-MuiOutlinedInput-notchedOutline"
            >
                <legend
                    class="hardcoded-PrivateNotchedOutline-legendLabelled-69 hardcoded-PrivateNotchedOutline-legendNotched-70"
                >
                    <span>Expected datetime</span>
                </legend>
            </fieldset>
        </div>
    </div>
}
