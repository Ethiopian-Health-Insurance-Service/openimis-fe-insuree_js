import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { INSUREE_EMPLOYEMENT_TYPE } from "../constants";

class InsureeEmployementTypePicker extends Component {
  render() {
    return (
      <ConstantBasedPicker
        module="insuree"
        label="InsureeEmployementType"
        constants={INSUREE_EMPLOYEMENT_TYPE}
        {...this.props}
      />
    );
  }
}

export default InsureeEmployementTypePicker;
