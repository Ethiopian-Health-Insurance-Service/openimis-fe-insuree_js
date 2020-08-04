import React, { Component, Fragment } from "react";
import { injectIntl } from 'react-intl';
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import {
    formatMessageWithValues, withModulesManager, withHistory, historyPush, journalize,
    Form, ProgressOrError
} from "@openimis/fe-core";
import { RIGHT_INSUREE } from "../constants";
import FamilyDisplayPanel from "./FamilyDisplayPanel";
import InsureeMasterPanel from "../components/InsureeMasterPanel";


import { fetchInsureeFull } from "../actions";
import { insureeLabel } from "../utils/utils";

const styles = theme => ({
    page: theme.page,
});

const INSUREE_INSUREE_PANELS_CONTRIBUTION_KEY = "insuree.Insuree.panels"

class InsureeForm extends Component {

    state = {
        lockNew: false,
        reset: 0,
        insuree: this._newInsuree(),
        newInsuree: true,
    }

    _newInsuree() {
        let insuree = {};
        insuree.jsonExt = {};
        return insuree;
    }

    componentDidMount() {
        document.title = formatMessageWithValues(this.props.intl, "insuree", "Insuree.title", { label: "" })
        if (this.props.insuree_uuid) {
            this.setState(
                (state, props) => ({ insuree_uuid: props.insuree_uuid }),
                e => this.props.fetchInsureeFull(
                    this.props.modulesManager,
                    this.props.insuree_uuid
                )
            )
        }
    }

    back = e => {
        const { modulesManager, history, family_uuid, insuree_uuid } = this.props;
        if (family_uuid) {
            historyPush(modulesManager,
                history,
                "insuree.route.familyOverview",
                [family_uuid]
            );
        } else {
            historyPush(modulesManager,
                history,
                "insuree.route.insurees"
            );
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((prevState.insuree && prevState.insuree.chfId)
            !== (this.state.insuree && this.state.insuree.chfId)) {
            document.title = formatMessageWithValues(this.props.intl, "insuree", "Insuree.title", { label: insureeLabel(this.state.insuree) })
        }
        if (prevProps.fetchedInsuree !== this.props.fetchedInsuree && !!this.props.fetchedInsuree) {
            var insuree = this.props.insuree;
            insuree.ext = !!insuree.jsonExt ? JSON.parse(insuree.jsonExt) : {};
            this.setState(
                { insuree, insuree_uuid: insuree.uuid, lockNew: false, newInsuree: false });
        } else if (prevProps.insuree_uuid && !this.props.insuree_uuid) {
            document.title = formatMessageWithValues(this.props.intl, "insuree", "Insuree.title", { label: insureeLabel(this.state.insuree) })
            this.setState({ insuree: this._newInsuree(), newInsuree: true, lockNew: false, insuree_uuid: null });
        } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
            this.props.journalize(this.props.mutation);
            this.setState({ reset: this.state.reset + 1 });
        }
    }

    _add = () => {
        this.setState((state) => ({
            insuree: this._newInsuree(),
            newInsuree: true,
            lockNew: false,
            reset: state.reset + 1,
        }),
            e => {
                this.props.add();
                this.forceUpdate();
            }
        )
    }

    reload = () => {
        this.props.fetchInsuree(
            this.props.modulesManager,
            this.state.insuree_uuid
        );
    }

    canSave = () => {
        if (!this.state.insuree.chfId) return false;
        if (!this.state.insuree.lastName) return false;
        if (!this.state.insuree.otherNames) return false;
        if (!this.state.insuree.dob) return false;
        return true;
    }

    _save = (insuree) => {
        this.setState(
            { lockNew: !insuree.uuid }, // avoid duplicates
            e => this.props.save(insuree))
    }

    onEditedChanged = insuree => {
        this.setState({ insuree, newInsuree: false })
    }

    render() {
        const { rights,
            insuree_uuid, fetchingInsuree, fetchedInsuree, errorInsuree,
            readOnly = false, 
            add, save,
        } = this.props;
        const { insuree } = this.state;
        if (!rights.includes(RIGHT_INSUREE)) return null;
        return (
            <Fragment>
                <ProgressOrError progress={fetchingInsuree} error={errorInsuree} />
                {((!!fetchedInsuree && !!insuree && insuree.uuid === insuree_uuid) || !insuree_uuid) && (
                    <Form
                        module="insuree"
                        title="Insuree.title"
                        titleParams={{ label: insureeLabel(this.state.insuree) }}
                        edited_id={insuree_uuid}
                        edited={this.state.insuree}
                        reset={this.state.reset}
                        back={this.back}
                        add={!!add && !this.state.newInsuree ? this._add : null}
                        readOnly={readOnly}
                        HeadPanel={FamilyDisplayPanel}
                        Panels={[InsureeMasterPanel]}
                        contributedPanelsKey={INSUREE_INSUREE_PANELS_CONTRIBUTION_KEY}
                        insuree={this.state.insuree}
                        onEditedChanged={this.onEditedChanged}
                        canSave={this.canSave}
                        save={!!save ? this._save : null}
                    />
                )}
            </Fragment>
        )
    }
}

const mapStateToProps = (state, props) => ({
    rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
    fetchingInsuree: state.insuree.fetchingInsuree,
    errorInsuree: state.insuree.errorInsuree,
    fetchedInsuree: state.insuree.fetchedInsuree,
    insuree: state.insuree.insuree,
    submittingMutation: state.insuree.submittingMutation,
    mutation: state.insuree.mutation,
})

export default withHistory(withModulesManager(connect(mapStateToProps, { fetchInsureeFull, journalize })(
    injectIntl(withTheme(withStyles(styles)(InsureeForm))
    ))));