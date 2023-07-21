import React, { Component, PropTypes } from "react";
import { sseConnection } from "@jenkins-cd/blueocean-core-js";

export default class Usain extends Component {
  constructor(props) {
    super(props);
    this.run = props.run;
    this.state = {
      runState: this.run.state,
    };
  }

  componentWillMount() {
    const usain = this;
    this.jobEventListener = sseConnection.subscribe("job", (event) => {
      if (
        event.jenkins_event === "job_run_ended" &&
        event.blueocean_job_pipeline_name === usain.run.pipeline &&
        event.jenkins_object_id === usain.run.id
      ) {
        usain.setState({
          runState: "FINISHED",
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.jobEventListener) {
      sseConnection.unsubscribe(this.jobEventListener);
    }
  }

  getBranchName() {
    return this.props.branchName || "development";
  }

  render() {
    let toolTip;

    const url = `http://${this.getBranchName().replace(
      /\//g,
      "-"
    )}.rainadev.tech`;
    if (this.state.runState === "RUNNING") {
      toolTip = (
        <div>
          <span>等待 pipeline 执行完成后访问预览网站: </span>
          <a href={url} target="_blank">
            {url}
          </a>
        </div>
      );
    } else if (
      this.state.runState === "FINISHED" &&
      this.props.run.result === "SUCCESS"
    ) {
      toolTip = (
        <div>
          <span>访问预览网站: </span>
          <a href={url} target="_blank">
            {url}
          </a>
        </div>
      );
    }
    return !!this.props.pipelineName.includes("Frontend-Design-Flow") ? (
      <div className="design-flow-extra-container">{toolTip}</div>
    ) : null;
  }
}

Usain.propTypes = {
  run: PropTypes.object,
};
