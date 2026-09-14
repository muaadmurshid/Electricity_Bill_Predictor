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

  return (
    <section className="tariff-intelligence-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Tariff intelligence
          </p>

          <h1>
            Understand your electricity tariff
          </h1>

          <p className="page-description">
            See your current tariff block,
            next threshold and how changes
            in electricity usage may affect
            your estimated monthly bill.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="tariff-control-card">
        <div className="tariff-control-grid">
          <label>
            <span>
              Tariff
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

            <div className="input-with-unit">
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
            className="primary-button"
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
      </div>

      {intelligence && (
        <>
          <div className="tariff-summary-grid">
            <article className="tariff-stat-card">
              <p className="tariff-stat-label">
                Estimated bill
              </p>

              <h2>
                {formatMoney(
                  intelligence
                    .currentEstimatedBill
                )}
              </h2>

              <p>
                At{" "}
                {
                  intelligence
                    .currentUnits
                }{" "}
                kWh this month.
              </p>
            </article>

            <article className="tariff-stat-card">
              <p className="tariff-stat-label">
                Current tariff block
              </p>

              <h2>
                {getBlockLabel()}
              </h2>

              <p>
                {formatGroup(
                  intelligence
                    .consumerGroup
                )}
              </p>
            </article>

            <article className="tariff-stat-card">
              <p className="tariff-stat-label">
                Current unit rate
              </p>

              <h2>
                {formatMoney(
                  intelligence
                    .currentRatePerUnit
                )}
              </h2>

              <p>
                Per kWh in the current
                block.
              </p>
            </article>

            <article className="tariff-stat-card">
              <p className="tariff-stat-label">
                Fixed charge
              </p>

              <h2>
                {formatMoney(
                  intelligence
                    .currentFixedCharge
                )}
              </h2>

              <p>
                Applied to the current
                consumption band.
              </p>
            </article>
          </div>

          <div className="tariff-threshold-card">
            <div>
              <p className="eyebrow">
                Next threshold
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
          </div>

          <div className="tariff-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  Cost scenarios
                </p>

                <h2>
                  Estimated bill by usage
                </h2>
              </div>
            </div>

            <div className="tariff-scenario-grid">
              {intelligence.scenarios?.map(
                (scenario) => (
                  <article
                    className="tariff-scenario-card"
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
                  </article>
                )
              )}
            </div>
          </div>

          <div className="tariff-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  What-if calculator
                </p>

                <h2>
                  See the impact of changing
                  your usage
                </h2>
              </div>
            </div>

            <div className="tariff-whatif-card">
              <div className="tariff-whatif-controls">
                <label>
                  <span>
                    Current usage
                  </span>

                  <div className="input-with-unit">
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

                  <div className="input-with-unit">
                    <input
                      type="number"
                      min="0"
                      value={targetUnits}
                      onChange={(event) =>
                        setTargetUnits(
                          event.target
                            .value
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
                  className="primary-button"
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
                <div className="tariff-whatif-results">
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
                      Percentage difference
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
          </div>
        </>
      )}
    </section>
  );
}