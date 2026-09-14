import {
  useEffect,
  useMemo,
  useState,
} from "react";

import tariffIntelligenceService
  from "../services/tariffIntelligenceService";

import tariffService
  from "../services/tariffService";

export default function TariffIntelligence() {
  const [tariffs, setTariffs] =
    useState([]);

  const [selectedTariffId, setSelectedTariffId] =
    useState("");

  const [units, setUnits] =
    useState(145);

  const [targetUnits, setTargetUnits] =
    useState(120);

  const [intelligence, setIntelligence] =
    useState(null);

  const [whatIf, setWhatIf] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [whatIfLoading, setWhatIfLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const activeTariffs =
    useMemo(() => {
      return tariffs.filter(
        (tariff) =>
          tariff.status === "ACTIVE"
      );
    }, [tariffs]);

  useEffect(() => {
    loadTariffs();
  }, []);

  async function loadTariffs() {
    try {
      const data =
        await tariffService.list();

      const list =
        Array.isArray(data)
          ? data
          : [];

      setTariffs(list);

      const active =
        list.find(
          (tariff) =>
            tariff.status === "ACTIVE"
        );

      if (active) {
        setSelectedTariffId(
          String(
            active.tariffId
          )
        );
      } else if (
        list.length > 0
      ) {
        setSelectedTariffId(
          String(
            list[0].tariffId
          )
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load tariffs."
      );
    }
  }

  async function loadIntelligence() {
    if (!selectedTariffId) {
      setError(
        "Please select a tariff."
      );
      return;
    }

    if (
      units === "" ||
      Number(units) < 0
    ) {
      setError(
        "Enter a valid usage value."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await tariffIntelligenceService
          .getIntelligence(
            Number(
              selectedTariffId
            ),
            Number(units)
          );

      setIntelligence(data);

      setTargetUnits(
        Math.max(
          Number(units) - 25,
          0
        )
      );

      setWhatIf(null);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load tariff intelligence."
      );
    } finally {
      setLoading(false);
    }
  }

  async function calculateWhatIf() {
    if (!selectedTariffId) {
      setError(
        "Please select a tariff."
      );
      return;
    }

    if (
      targetUnits === "" ||
      Number(targetUnits) < 0
    ) {
      setError(
        "Enter a valid target usage."
      );
      return;
    }

    try {
      setWhatIfLoading(true);
      setError("");

      const data =
        await tariffIntelligenceService
          .calculateWhatIf(
            Number(
              selectedTariffId
            ),
            Number(units),
            Number(targetUnits)
          );

      setWhatIf(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to calculate what-if scenario."
      );
    } finally {
      setWhatIfLoading(false);
    }
  }

  function formatMoney(value) {
    const number =
      Number(value || 0);

    return new Intl.NumberFormat(
      "en-LK",
      {
        style: "currency",
        currency: "LKR",
        minimumFractionDigits: 2,
      }
    ).format(number);
  }

  function formatGroup(value) {
    if (!value) {
      return "—";
    }

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }

  function getBlockLabel() {
    if (!intelligence) {
      return "—";
    }

    const min =
      intelligence.currentBlockMinUnits;

    const max =
      intelligence.currentBlockMaxUnits;

    if (max == null) {
      return `${min}+ kWh`;
    }

    return `${min}–${max} kWh`;
  }

  function getSavingTone() {
    if (!whatIf) {
      return "neutral";
    }

    if (
      Number(
        whatIf.billDifference
      ) > 0
    ) {
      return "saving";
    }

    if (
      Number(
        whatIf.billDifference
      ) < 0
    ) {
      return "increase";
    }

    return "neutral";
  }

  return (
    <div className="tariff-redesign">
      <section className="tariff-redesign-hero">
        <div className="tariff-redesign-orb tariff-redesign-orb-one" />
        <div className="tariff-redesign-orb tariff-redesign-orb-two" />

        <div className="tariff-redesign-hero-content">
          <div>
            <p className="dashboard-kicker dashboard-kicker-light">
              Tariff intelligence
            </p>

            <h1>
              Understand what your
              electricity really costs.
            </h1>

            <p>
              Explore your current tariff
              block, upcoming threshold
              and the financial impact of
              changing your monthly
              electricity usage.
            </p>
          </div>

          <div className="tariff-redesign-hero-badge">
            <span>
              ₨
            </span>

            <div>
              <small>
                Sri Lankan
              </small>

              <strong>
                Tariff insight
              </strong>
            </div>
          </div>
        </div>

        <div className="tariff-redesign-controls">
          <label>
            <span>
              Active tariff
            </span>

            <select
              value={
                selectedTariffId
              }
              onChange={(event) =>
                setSelectedTariffId(
                  event.target.value
                )
              }
            >
              <option value="">
                Select tariff
              </option>

              {activeTariffs.map(
                (tariff) => (
                  <option
                    key={
                      tariff.tariffId
                    }
                    value={
                      tariff.tariffId
                    }
                  >
                    {
                      tariff.tariffName
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>
              Monthly usage
            </span>

            <div className="tariff-redesign-input">
              <input
                type="number"
                min="0"
                value={units}
                onChange={(event) =>
                  setUnits(
                    event.target.value
                  )
                }
              />

              <span>
                kWh
              </span>
            </div>
          </label>

          <button
            type="button"
            className="tariff-redesign-primary"
            onClick={
              loadIntelligence
            }
            disabled={loading}
          >
            {loading
              ? "Analysing..."
              : "Analyse tariff"}
          </button>
        </div>
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {intelligence && (
        <>
          <section className="tariff-redesign-summary">
            <article className="tariff-redesign-stat tariff-redesign-stat-feature">
              <div className="tariff-redesign-stat-icon">
                ₨
              </div>

              <span>
                Estimated bill
              </span>

              <strong>
                {formatMoney(
                  intelligence
                    .currentEstimatedBill
                )}
              </strong>

              <p>
                At{" "}
                {
                  intelligence
                    .currentUnits
                }{" "}
                kWh this month.
              </p>
            </article>

            <article className="tariff-redesign-stat">
              <div className="tariff-redesign-stat-icon">
                ▦
              </div>

              <span>
                Current block
              </span>

              <strong>
                {getBlockLabel()}
              </strong>

              <p>
                {formatGroup(
                  intelligence
                    .consumerGroup
                )}
              </p>
            </article>

            <article className="tariff-redesign-stat">
              <div className="tariff-redesign-stat-icon tariff-redesign-stat-icon-green">
                ⚡
              </div>

              <span>
                Unit rate
              </span>

              <strong>
                {formatMoney(
                  intelligence
                    .currentRatePerUnit
                )}
              </strong>

              <p>
                Current block price per
                kWh.
              </p>
            </article>

            <article className="tariff-redesign-stat">
              <div className="tariff-redesign-stat-icon">
                ◫
              </div>

              <span>
                Fixed charge
              </span>

              <strong>
                {formatMoney(
                  intelligence
                    .currentFixedCharge
                )}
              </strong>

              <p>
                Applied to the current
                usage band.
              </p>
            </article>
          </section>

          <section className="tariff-redesign-threshold">
            <div>
              <p className="dashboard-kicker dashboard-kicker-light">
                Next tariff threshold
              </p>

              {intelligence
                .nextThresholdUnits !=
              null ? (
                <>
                  <h2>
                    {
                      intelligence
                        .nextThresholdUnits
                    }{" "}
                    kWh
                  </h2>

                  <p>
                    You have{" "}
                    <strong>
                      {
                        intelligence
                          .unitsRemainingToNextThreshold
                      }{" "}
                      kWh
                    </strong>{" "}
                    remaining before
                    entering the next
                    tariff block.
                  </p>
                </>
              ) : (
                <>
                  <h2>
                    Highest block
                  </h2>

                  <p>
                    Your current usage is
                    already in the highest
                    configured tariff
                    block.
                  </p>
                </>
              )}
            </div>

            <div className="tariff-redesign-threshold-visual">
              <span>
                {
                  intelligence
                    .currentUnits
                }
              </span>

              <small>
                current kWh
              </small>
            </div>
          </section>

          <section className="tariff-redesign-section">
            <div className="tariff-redesign-section-head">
              <div>
                <p className="dashboard-kicker">
                  Cost scenarios
                </p>

                <h2>
                  Estimated bill by usage
                </h2>
              </div>

              <p>
                Compare how your estimated
                bill changes as electricity
                consumption increases.
              </p>
            </div>

            <div className="tariff-redesign-scenarios">
              {intelligence.scenarios?.map(
                (
                  scenario,
                  index
                ) => (
                  <article
                    className={`tariff-redesign-scenario ${
                      index === 0
                        ? "tariff-redesign-scenario-green"
                        : ""
                    }`}
                    key={
                      scenario.units
                    }
                  >
                    <span>
                      {
                        scenario.units
                      }{" "}
                      kWh
                    </span>

                    <strong>
                      {formatMoney(
                        scenario
                          .estimatedBill
                      )}
                    </strong>

                    <div className="tariff-redesign-scenario-line" />
                  </article>
                )
              )}
            </div>
          </section>

          <section className="tariff-redesign-whatif">
            <div className="tariff-redesign-whatif-copy">
              <p className="dashboard-kicker dashboard-kicker-light">
                What-if calculator
              </p>

              <h2>
                See what happens if you use
                less electricity.
              </h2>

              <p>
                Compare your current
                estimated bill with a
                different monthly usage
                target before making a
                decision.
              </p>
            </div>

            <div className="tariff-redesign-whatif-card">
              <div className="tariff-redesign-whatif-controls">
                <label>
                  <span>
                    Current usage
                  </span>

                  <div className="tariff-redesign-input">
                    <input
                      type="number"
                      value={units}
                      disabled
                    />

                    <span>
                      kWh
                    </span>
                  </div>
                </label>

                <label>
                  <span>
                    Target usage
                  </span>

                  <div className="tariff-redesign-input">
                    <input
                      type="number"
                      min="0"
                      value={targetUnits}
                      onChange={(event) =>
                        setTargetUnits(
                          event.target.value
                        )
                      }
                    />

                    <span>
                      kWh
                    </span>
                  </div>
                </label>

                <button
                  type="button"
                  className="tariff-redesign-primary"
                  onClick={
                    calculateWhatIf
                  }
                  disabled={
                    whatIfLoading
                  }
                >
                  {whatIfLoading
                    ? "Calculating..."
                    : "Calculate impact"}
                </button>
              </div>

              {whatIf && (
                <div
                  className={`tariff-redesign-result tariff-redesign-result-${getSavingTone()}`}
                >
                  <div>
                    <span>
                      Current bill
                    </span>

                    <strong>
                      {formatMoney(
                        whatIf.currentBill
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Target bill
                    </span>

                    <strong>
                      {formatMoney(
                        whatIf.targetBill
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Usage difference
                    </span>

                    <strong>
                      {
                        whatIf.unitDifference
                      }{" "}
                      kWh
                    </strong>
                  </div>

                  <div>
                    <span>
                      Bill difference
                    </span>

                    <strong>
                      {formatMoney(
                        whatIf.billDifference
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Difference
                    </span>

                    <strong>
                      {
                        whatIf.percentageDifference
                      }
                      %
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}