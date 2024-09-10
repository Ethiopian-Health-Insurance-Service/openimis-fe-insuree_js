import React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";

import { withModulesManager, useModulesManager, ValidatedTextInput, formatMessage } from "@openimis/fe-core";
import { ValidateInputValue, inputValueSetIsValid, inputValueClearAction } from "../actions";

const ValidateInputPicker = (props) => {
  const {
    value,
    onChange,
    className,
    label,
    placeholder,
    readOnly,
    required,
    inputValueValid,
    inputValueValidating,
    searchTitle,
    inputValueValidationError,
    searchString,
    intl
  } = props;
  const modulesManager = useModulesManager();
  const numberMaxLength = modulesManager.getConf("fe-insuree", "insureeForm.chfIdMaxLength", 12);
  const inputValueValidationErrorMessage = formatMessage(intl, 'insuree', 'errorMessage')

  const shouldValidate = (inputValue) => {
    const { savedNationalId, headSelected } = props;

    if (headSelected && savedNationalId && inputValue === savedNationalId) return false;

    if (!headSelected || (headSelected && savedNationalId)) return inputValue !== savedNationalId;
  };


  return (
    <ValidatedTextInput
      itemQueryIdentifier="nationalId"
      codeTakenLabel={inputValueValidationErrorMessage}
      shouldValidate={shouldValidate}
      isValid={inputValueValid}
      isValidating={inputValueValidating}
      validationError={inputValueValidationError}
      action={ValidateInputValue}
      clearAction={inputValueClearAction}
      setValidAction={inputValueSetIsValid}
      module="insuree"
      className={className}
      readOnly={readOnly}
      required={required}
      label={label}
      placeholder={placeholder}
      value={value}
      inputProps={{ maxLength: numberMaxLength }}
      onChange={onChange}
    />
  );
};
const mapStateToProps = (state) => ({
  inputValueValid: state.insuree.validationFields?.inputValue?.isValid,
  inputValueValidating: state.insuree.validationFields?.inputValue?.isValidating,
  inputValueValidationError: state.insuree.validationFields?.inputValue?.validationError,
  savedNationalId: state.insuree?.insuree?.nationalId,
  headSelected: state.insuree?.headSelected,
});

export default withModulesManager(connect(mapStateToProps)(injectIntl(ValidateInputPicker)));
