import {
  useEffect,
  useMemo,
  useState,
} from "react";

import householdService from "../services/householdService";

function formatHouseType(value) {
  switch (value) {
    case "HOUSE":
      return "House";

    case "APARTMENT":
      return "Apartment";

    case "ANNEX":
      return "Annex";

    case "OTHER":
      return "Other";

    default:
      return value || "—";
  }
}

export default function Household() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState({
    householdName: "",
    location: "",
    houseType: "",
    numberOfResidents: "",
  });

  useEffect(() => {
    loadHouseholds();
  }, []);

  async function loadHouseholds() {
    try {
      setLoading(true);
      setError("");

      const data =
        await householdService.list();

      setHouseholds(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load households:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load household details."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  }

  function validateForm() {
    if (
      !formData.householdName.trim()
    ) {
      setError(
        "Please enter a household name."
      );

      return false;
    }

    if (
      !formData.location.trim()
    ) {
      setError(
        "Please enter a location."
      );

      return false;
    }

    if (
      !formData.houseType
    ) {
      setError(
        "Please select a house type."
      );

      return false;
    }

    if (
      formData.numberOfResidents ===
        "" ||
      Number(
        formData.numberOfResidents
      ) < 1
    ) {
      setError(
        "Number of residents must be at least 1."
      );

      return false;
    }

    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    const payload = {
      householdName:
        formData.householdName.trim(),

      location:
        formData.location.trim(),

      houseType:
        formData.houseType.trim(),

      numberOfResidents:
        Number(
          formData.numberOfResidents
        ),
    };

    try {
      setSaving(true);

      if (editingId) {
        await householdService.update(
          editingId,
          payload
        );

        setSuccess(
          "Household updated successfully."
        );
      } else {
        await householdService.create(
          payload
        );

        setSuccess(
          "Household created successfully."
        );
      }

      resetForm();

      await loadHouseholds();
    } catch (err) {
      console.error(
        "Failed to save household:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save household."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(household) {
    setEditingId(
      household.householdId
    );

    setFormData({
      householdName:
        household.householdName ||
        "",

      location:
        household.location ||
        "",

      houseType:
        household.houseType ||
        "",

      numberOfResidents:
        household.numberOfResidents !==
          null &&
        household.numberOfResidents !==
          undefined
          ? String(
              household.numberOfResidents
            )
          : "",
    });

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      householdName: "",
      location: "",
      houseType: "",
      numberOfResidents: "",
    });
  }

  async function handleDelete(
    householdId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this household?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await householdService.remove(
        householdId
      );

      if (
        editingId === householdId
      ) {
        resetForm();
      }

      setSuccess(
        "Household deleted successfully."
      );

      await loadHouseholds();
    } catch (err) {
      console.error(
        "Failed to delete household:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete household."
      );
    }
  }

  const primaryHousehold =
    useMemo(
      () =>
        households.length > 0
          ? households[0]
          : null,
      [households]
    );

  return (
    <div className="household-redesign">
      <section className="household-redesign-hero">
        <div className="household-redesign-orb household-redesign-orb-one" />
        <div className="household-redesign-orb household-redesign-orb-two" />

        <div className="household-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            My home
          </p>

          <h1>
            Build the energy profile of
            your household.
          </h1>

          <p>
            Your rooms, appliances,
            electricity usage, bills,
            predictions, budgets and
            energy goals are all linked
            to the household you create
            here.
          </p>
        </div>

        <div className="household-redesign-hero-badge">
          <span>
            ⌂
          </span>

          <div>
            <small>
              Home profile
            </small>

            <strong>
              Household
            </strong>
          </div>
        </div>

        {primaryHousehold && (
          <div className="household-redesign-active">
            <div>
              <span>
                Primary household
              </span>

              <strong>
                {
                  primaryHousehold.householdName
                }
              </strong>
            </div>

            <div>
              <span>
                Location
              </span>

              <strong>
                {
                  primaryHousehold.location
                }
              </strong>
            </div>

            <div>
              <span>
                Residents
              </span>

              <strong>
                {
                  primaryHousehold.numberOfResidents
                }
              </strong>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {success && (
        <div className="prediction-redesign-success">
          <span>
            ✓
          </span>

          {success}
        </div>
      )}

      <section className="household-redesign-summary">
        <article className="household-redesign-stat household-redesign-stat-feature">
          <div className="household-redesign-stat-icon">
            ⌂
          </div>

          <span>
            Households
          </span>

          <strong>
            {
              households.length
            }
          </strong>

          <p>
            Home profiles linked to your
            account.
          </p>
        </article>

        <article className="household-redesign-stat">
          <div className="household-redesign-stat-icon household-redesign-stat-icon-green">
            ◯
          </div>

          <span>
            Residents
          </span>

          <strong>
            {households.reduce(
              (
                total,
                household
              ) =>
                total +
                Number(
                  household.numberOfResidents ||
                    0
                ),
              0
            )}
          </strong>

          <p>
            People across your saved
            households.
          </p>
        </article>

        <article className="household-redesign-stat">
          <div className="household-redesign-stat-icon">
            ▦
          </div>

          <span>
            Home type
          </span>

          <strong>
            {primaryHousehold
              ? formatHouseType(
                  primaryHousehold.houseType
                )
              : "—"}
          </strong>

          <p>
            Primary household type.
          </p>
        </article>
      </section>

      <section className="household-redesign-grid">
        <article className="household-redesign-form-card">
          <div className="household-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Household setup
              </p>

              <h2>
                {editingId
                  ? "Edit household"
                  : "Add household"}
              </h2>
            </div>

            <span className="household-redesign-form-icon">
              ⌂
            </span>
          </div>

          <form
            className="household-redesign-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>
                Household name
              </span>

              <input
                type="text"
                name="householdName"
                value={
                  formData.householdName
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: My Home"
              />
            </label>

            <label>
              <span>
                Location
              </span>

              <input
                type="text"
                name="location"
                value={
                  formData.location
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: Colombo"
              />
            </label>

            <div className="household-redesign-two-column">
              <label>
                <span>
                  House type
                </span>

                <select
                  name="houseType"
                  value={
                    formData.houseType
                  }
                  onChange={
                    handleChange
                  }
                  required
                >
                  <option value="">
                    Select house type
                  </option>

                  <option value="HOUSE">
                    House
                  </option>

                  <option value="APARTMENT">
                    Apartment
                  </option>

                  <option value="ANNEX">
                    Annex
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Residents
                </span>

                <input
                  type="number"
                  name="numberOfResidents"
                  value={
                    formData.numberOfResidents
                  }
                  onChange={
                    handleChange
                  }
                  required
                  min="1"
                  placeholder="4"
                />
              </label>
            </div>

            <div className="household-redesign-actions">
              <button
                type="submit"
                className="household-redesign-primary"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update household"
                    : "Create household"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="household-redesign-secondary"
                  onClick={
                    resetForm
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="household-redesign-list-card">
          <div className="household-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Home profiles
              </p>

              <h2>
                Your households
              </h2>
            </div>

            <span className="household-redesign-count">
              {
                households.length
              }
            </span>
          </div>

          {loading ? (
            <div className="household-redesign-empty">
              Loading households...
            </div>
          ) : households.length ===
            0 ? (
            <div className="household-redesign-empty">
              <div className="household-redesign-empty-icon">
                ⌂
              </div>

              <strong>
                No household yet
              </strong>

              <span>
                Create your first
                household using the form.
              </span>
            </div>
          ) : (
            <div className="household-redesign-list">
              {households.map(
                (
                  household,
                  index
                ) => (
                  <article
                    key={
                      household.householdId
                    }
                    className={`household-redesign-item ${
                      index === 0
                        ? "household-redesign-item-featured"
                        : ""
                    }`}
                  >
                    <div className="household-redesign-item-top">
                      <div className="household-redesign-item-icon">
                        ⌂
                      </div>

                      <div className="household-redesign-item-title">
                        <span>
                          Household
                        </span>

                        <h3>
                          {
                            household.householdName
                          }
                        </h3>

                        <p>
                          {
                            household.location
                          }
                        </p>
                      </div>

                      {index === 0 && (
                        <span className="household-redesign-primary-badge">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="household-redesign-item-values">
                      <div>
                        <span>
                          Home type
                        </span>

                        <strong>
                          {formatHouseType(
                            household.houseType
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Residents
                        </span>

                        <strong>
                          {
                            household.numberOfResidents
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Household ID
                        </span>

                        <strong>
                          #
                          {
                            household.householdId
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="household-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            household
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="household-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            household.householdId
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}