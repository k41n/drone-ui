import React, { Component } from "react";
import client from "config/client";
import style from "./coverage_info.less";

export class CoverageInfo extends Component {
  state = {
    coveragePercent: undefined
  }

  owner() {
    return location.pathname.split('/')[1]
  }

  repo() {
    return location.pathname.split('/')[2]
  }

  extractCoverageFromLogs(logLines) {
    let logLine = logLines.find( (logLine) => {
      return /Coverage report/.test(logLine.out)
    })
    this.setState({
      coveragePercent: logLine.out.match(/\(([^)]*)\)/ig)
    })
  }

  componentDidMount() {
		client.getLogs(
      this.owner(),
      this.repo(),
      this.props.build.number,
      this.procWithCoverage().children[1].pgid
		)
    .then( (results) => {
      this.extractCoverageFromLogs(results)
    })
  }

  procWithCoverage() {
    const procs = this.props.build.procs
    return procs.find( (p) => (p.environ['COVERAGE_EXPORT']) )
  }

  coverageUrl() {
    const { build } = this.props
    const proc = this.procWithCoverage()
    return `http://ci2.redminecrm.com/builds/${build.id}/${proc.environ['PLUGIN']}/${proc.environ['DB']}/${proc.environ['RUBY_VER']}/${proc.environ['REDMINE']}/index.html`
  }

	render() {
    const url = this.coverageUrl()
    return <a target='_newtab' className={ style.root } href={ url }>Coverage { this.state.coveragePercent }</a>
  }
}
