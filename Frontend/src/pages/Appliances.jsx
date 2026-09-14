import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import householdService from "../services/householdService";
import roomService from "../services/roomService";
import applianceService from "../services/applianceService";
import applianceCategoryService from "../services/applianceCategoryService";
import applianceVisionService from "../services/applianceVisionService";

function categoryName(category) {
  return (
    category?.categoryName ||
    category?.name ||
    "Uncategorised"
  );
}

function statusLabel(status) {
  return status === "INACTIVE"
    ? "Inactive"
    : "Active";
}

export default function Appliances() {
  const [
    households,
    setHouseholds,
  ] = useState([]);

  const [
    rooms,
    setRooms,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    appliances,
    setAppliances,
  ] = useState([]);

  const [
    selectedHouseholdId,
    setSelectedHouseholdId,
  ] = useState("");

  const [
    selectedRoomId,
    setSelectedRoomId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [
    analysingImage,
    setAnalysingImage,
  ] = useState(false);

  const [
    visionNotes,
    setVisionNotes,
  ] = useState("");

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
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const uploadInputRef =
    useRef(null);

  const cameraInputRef =
    useRef(null);

  const [
    formData,
    setFormData,
  ] = useState({
    applianceName: "",
    categoryId: "",
    brand: "",
    model: "",
    ratedPower: "",
    voltage: "",
    quantity: "1",
    energyRating: "",
    typicalDailyHours: "",
    status: "ACTIVE",
    imagePath: "",
    aiDetected: false,
  });

  useEffect(() => {
    initialise();
  }, []);

  useEffect(() => {
    if (selectedHouseholdId) {
      loadRooms(
        selectedHouseholdId
      );
    } else {
      setRooms([]);
      setSelectedRoomId("");
      setAppliances([]);
    }
  }, [selectedHouseholdId]);

  useEffect(() => {
    if (selectedRoomId) {
      loadAppliances(
        selectedRoomId
      );
    } else {
      setAppliances([]);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [imagePreview]);

  async function initialise() {
    try {
      setLoading(true);
      setError("");

      const [
        householdData,
        categoryData,
      ] = await Promise.all([
        householdService.list(),
        applianceCategoryService.list(),
      ]);

      const householdList =
        Array.isArray(
          householdData
        )
          ? householdData
          : [];

      const categoryList =
        Array.isArray(
          categoryData
        )
          ? categoryData
          : [];

      setHouseholds(
        householdList
      );

      setCategories(
        categoryList
      );

      if (
        householdList.length >
        0
      ) {
        setSelectedHouseholdId(
          String(
            householdList[0]
              .householdId
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to initialise appliances page:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load appliance information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRooms(
    householdId
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await roomService.listByHousehold(
          householdId
        );

      const roomList =
        Array.isArray(data)
          ? data
          : [];

      setRooms(
        roomList
      );

      if (
        roomList.length > 0
      ) {
        setSelectedRoomId(
          String(
            roomList[0].roomId
          )
        );
      } else {
        setSelectedRoomId("");
        setAppliances([]);
      }
    } catch (err) {
      console.error(
        "Failed to load rooms:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load rooms."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAppliances(
    roomId
  ) {
    try {
      setLoading(true);
      setError("");

      const data =
        await applianceService.listByRoom(
          roomId
        );

      setAppliances(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load appliances:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to load appliances."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHouseholdChange(
    event
  ) {
    setSelectedHouseholdId(
      event.target.value
    );

    setSelectedRoomId("");

    resetForm();
    setError("");
    setSuccess("");
  }

  function handleRoomChange(
    event
  ) {
    setSelectedRoomId(
      event.target.value
    );

    resetForm();
    setError("");
    setSuccess("");
  }

  function handleChange(
    event
  ) {
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

  function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please select a JPG, PNG or WEBP image."
      );

      event.target.value = "";

      return;
    }

    const maxFileSize =
      10 * 1024 * 1024;

    if (
      file.size >
      maxFileSize
    ) {
      setError(
        "Appliance image must be 10 MB or smaller."
      );

      event.target.value = "";

      return;
    }

    setError("");
    setSuccess("");
    setVisionNotes("");

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(
      file
    );

    setImagePreview(
      URL.createObjectURL(
        file
      )
    );
  }

  function removeSelectedImage() {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(null);
    setImagePreview("");
    setVisionNotes("");

    setFormData(
      (previous) => ({
        ...previous,
        aiDetected: false,
      })
    );

    if (
      uploadInputRef.current
    ) {
      uploadInputRef.current.value =
        "";
    }

    if (
      cameraInputRef.current
    ) {
      cameraInputRef.current.value =
        "";
    }
  }

  async function analyseSelectedImage() {
    if (!selectedImage) {
      setError(
        "Please upload or take an appliance photo first."
      );

      return;
    }

    try {
      setAnalysingImage(true);
      setError("");
      setSuccess("");
      setVisionNotes("");

      const result =
        await applianceVisionService.analyse(
          selectedImage
        );

      let matchedCategoryId =
        "";

      if (
        result?.categoryName
      ) {
        const aiCategory =
          result.categoryName
            .trim()
            .toLowerCase();

        const matchedCategory =
          categories.find(
            (category) => {
              const name =
                (
                  category.categoryName ||
                  category.name ||
                  ""
                )
                  .trim()
                  .toLowerCase();

              return (
                name ===
                  aiCategory ||
                name.includes(
                  aiCategory
                ) ||
                aiCategory.includes(
                  name
                )
              );
            }
          );

        if (
          matchedCategory
        ) {
          matchedCategoryId =
            String(
              matchedCategory.categoryId
            );
        }
      }

      setFormData(
        (previous) => ({
          ...previous,

          applianceName:
            result?.applianceName ||
            previous.applianceName,

          brand:
            result?.brand ||
            previous.brand,

          model:
            result?.model ||
            previous.model,

          ratedPower:
            result?.ratedPower !==
              null &&
            result?.ratedPower !==
              undefined
              ? String(
                  result.ratedPower
                )
              : previous.ratedPower,

          voltage:
            result?.voltage !==
              null &&
            result?.voltage !==
              undefined
              ? String(
                  result.voltage
                )
              : previous.voltage,

          energyRating:
            result?.energyRating ||
            previous.energyRating,

          categoryId:
            matchedCategoryId ||
            previous.categoryId,

          aiDetected: true,
        })
      );

      setVisionNotes(
        result?.notes ||
          "AI analysis completed. Please review the detected appliance details before saving."
      );
    } catch (err) {
      console.error(
        "Failed to analyse appliance image:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "The appliance image could not be analysed. Please try again."
      );
    } finally {
      setAnalysingImage(
        false
      );
    }
  }

  function validateForm() {
    if (!selectedRoomId) {
      setError(
        "Please select a room first."
      );

      return false;
    }

    if (
      !formData.applianceName.trim()
    ) {
      setError(
        "Please enter an appliance name."
      );

      return false;
    }

    if (
      !formData.categoryId
    ) {
      setError(
        "Please select an appliance category."
      );

      return false;
    }

    if (
      !formData.ratedPower ||
      Number(
        formData.ratedPower
      ) <= 0
    ) {
      setError(
        "Rated power must be greater than 0."
      );

      return false;
    }

    if (
      formData.voltage !== "" &&
      Number(
        formData.voltage
      ) < 0
    ) {
      setError(
        "Voltage cannot be negative."
      );

      return false;
    }

    if (
      !formData.quantity ||
      Number(
        formData.quantity
      ) < 1
    ) {
      setError(
        "Quantity must be at least 1."
      );

      return false;
    }

    if (
      formData.typicalDailyHours !==
        "" &&
      (
        Number(
          formData.typicalDailyHours
        ) < 0 ||
        Number(
          formData.typicalDailyHours
        ) > 24
      )
    ) {
      setError(
        "Typical daily hours must be between 0 and 24."
      );

      return false;
    }

    return true;
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    const payload = {
      room: {
        roomId:
          Number(
            selectedRoomId
          ),
      },

      category: {
        categoryId:
          Number(
            formData.categoryId
          ),
      },

      applianceName:
        formData.applianceName.trim(),

      brand:
        formData.brand.trim(),

      model:
        formData.model.trim(),

      ratedPower:
        Number(
          formData.ratedPower
        ),

      voltage:
        formData.voltage === ""
          ? null
          : Number(
              formData.voltage
            ),

      quantity:
        Number(
          formData.quantity
        ),

      energyRating:
        formData.energyRating.trim(),

      typicalDailyHours:
        formData.typicalDailyHours ===
        ""
          ? 0
          : Number(
              formData.typicalDailyHours
            ),

      status:
        formData.status,

      imagePath:
        formData.imagePath ||
        null,

      aiDetected:
        Boolean(
          formData.aiDetected
        ),
    };

    try {
      setSaving(true);

      let savedAppliance;

      if (editingId) {
        savedAppliance =
          await applianceService.update(
            editingId,
            payload
          );
      } else {
        savedAppliance =
          await applianceService.create(
            payload
          );
      }

      if (
        selectedImage &&
        savedAppliance?.applianceId
      ) {
        try {
          setUploadingImage(
            true
          );

          await applianceService.uploadImage(
            savedAppliance.applianceId,
            selectedImage
          );
        } catch (
          imageError
        ) {
          console.error(
            "Appliance saved but image upload failed:",
            imageError
          );

          setError(
            imageError?.response?.data
              ?.error ||
              imageError?.response
                ?.data?.message ||
              "The appliance was saved, but its photo could not be uploaded."
          );

          await loadAppliances(
            selectedRoomId
          );

          return;
        }
      }

      setSuccess(
        editingId
          ? "Appliance updated successfully."
          : "Appliance created successfully."
      );

      resetForm();

      await loadAppliances(
        selectedRoomId
      );
    } catch (err) {
      console.error(
        "Failed to save appliance:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to save appliance."
      );
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  function startEdit(
    appliance
  ) {
    removeSelectedImage();

    setEditingId(
      appliance.applianceId
    );

    if (
      appliance.room?.roomId
    ) {
      setSelectedRoomId(
        String(
          appliance.room.roomId
        )
      );
    }

    setFormData({
      applianceName:
        appliance.applianceName ||
        "",

      categoryId:
        appliance.category
          ?.categoryId !==
          undefined &&
        appliance.category
          ?.categoryId !==
          null
          ? String(
              appliance.category
                .categoryId
            )
          : "",

      brand:
        appliance.brand ||
        "",

      model:
        appliance.model ||
        "",

      ratedPower:
        appliance.ratedPower !==
          undefined &&
        appliance.ratedPower !==
          null
          ? String(
              appliance.ratedPower
            )
          : "",

      voltage:
        appliance.voltage !==
          undefined &&
        appliance.voltage !==
          null
          ? String(
              appliance.voltage
            )
          : "",

      quantity:
        appliance.quantity !==
          undefined &&
        appliance.quantity !==
          null
          ? String(
              appliance.quantity
            )
          : "1",

      energyRating:
        appliance.energyRating ||
        "",

      typicalDailyHours:
        appliance.typicalDailyHours !==
          undefined &&
        appliance.typicalDailyHours !==
          null
          ? String(
              appliance.typicalDailyHours
            )
          : "",

      status:
        appliance.status ||
        "ACTIVE",

      imagePath:
        appliance.imagePath ||
        "",

      aiDetected:
        Boolean(
          appliance.aiDetected
        ),
    });

    setVisionNotes("");
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setEditingId(null);

    setFormData({
      applianceName: "",
      categoryId: "",
      brand: "",
      model: "",
      ratedPower: "",
      voltage: "",
      quantity: "1",
      energyRating: "",
      typicalDailyHours: "",
      status: "ACTIVE",
      imagePath: "",
      aiDetected: false,
    });

    setVisionNotes("");

    removeSelectedImage();
  }

  async function handleDelete(
    applianceId
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this appliance?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await applianceService.remove(
        applianceId
      );

      if (
        editingId ===
        applianceId
      ) {
        resetForm();
      }

      setSuccess(
        "Appliance deleted successfully."
      );

      await loadAppliances(
        selectedRoomId
      );
    } catch (err) {
      console.error(
        "Failed to delete appliance:",
        err
      );

      setError(
        err?.response?.data
          ?.error ||
          err?.response?.data
            ?.message ||
          "Failed to delete appliance."
      );
    }
  }

  const selectedHousehold =
    useMemo(
      () =>
        households.find(
          (household) =>
            String(
              household.householdId
            ) ===
            String(
              selectedHouseholdId
            )
        ) || null,
      [
        households,
        selectedHouseholdId,
      ]
    );

  const selectedRoom =
    useMemo(
      () =>
        rooms.find(
          (room) =>
            String(
              room.roomId
            ) ===
            String(
              selectedRoomId
            )
        ) || null,
      [
        rooms,
        selectedRoomId,
      ]
    );

  const aiIdentifiedCount =
    useMemo(
      () =>
        appliances.filter(
          (appliance) =>
            appliance.aiDetected
        ).length,
      [appliances]
    );

  const totalRatedPower =
    useMemo(
      () =>
        appliances.reduce(
          (
            total,
            appliance
          ) =>
            total +
            Number(
              appliance.ratedPower ||
                0
            ) *
              Number(
                appliance.quantity ||
                  1
              ),
          0
        ),
      [appliances]
    );

  return (
    <div className="appliance-redesign">
      <section className="appliance-redesign-hero">
        <div className="appliance-redesign-orb appliance-redesign-orb-one" />
        <div className="appliance-redesign-orb appliance-redesign-orb-two" />

        <div className="appliance-redesign-hero-copy">
          <p className="dashboard-kicker dashboard-kicker-light">
            Smart appliance profile
          </p>

          <h1>
            Add appliances with a little
            help from AI.
          </h1>

          <p>
            Upload or photograph an
            appliance and let Vision AI
            identify visible details.
            Review the result yourself
            before saving it to your
            household energy profile.
          </p>
        </div>

        <div className="appliance-redesign-hero-badge">
          <span>
            AI
          </span>

          <div>
            <small>
              Vision assistant
            </small>

            <strong>
              Smart identification
            </strong>
          </div>
        </div>

        <div className="appliance-redesign-selectors">
          <label>
            <span>
              Household
            </span>

            <select
              value={
                selectedHouseholdId
              }
              onChange={
                handleHouseholdChange
              }
            >
              <option value="">
                Select household
              </option>

              {households.map(
                (household) => (
                  <option
                    key={
                      household.householdId
                    }
                    value={
                      household.householdId
                    }
                  >
                    {
                      household.householdName
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span>
              Room
            </span>

            <select
              value={
                selectedRoomId
              }
              onChange={
                handleRoomChange
              }
              disabled={
                !selectedHouseholdId
              }
            >
              <option value="">
                Select room
              </option>

              {rooms.map(
                (room) => (
                  <option
                    key={
                      room.roomId
                    }
                    value={
                      room.roomId
                    }
                  >
                    {
                      room.roomName
                    }
                  </option>
                )
              )}
            </select>
          </label>
        </div>
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

      <section className="appliance-redesign-summary">
        <article className="appliance-redesign-stat appliance-redesign-stat-feature">
          <div className="appliance-redesign-stat-icon">
            ⏻
          </div>

          <span>
            Appliances
          </span>

          <strong>
            {
              appliances.length
            }
          </strong>

          <p>
            Saved in the selected room.
          </p>
        </article>

        <article className="appliance-redesign-stat">
          <div className="appliance-redesign-stat-icon appliance-redesign-stat-icon-ai">
            AI
          </div>

          <span>
            AI identified
          </span>

          <strong>
            {
              aiIdentifiedCount
            }
          </strong>

          <p>
            Appliances assisted by
            Vision AI.
          </p>
        </article>

        <article className="appliance-redesign-stat">
          <div className="appliance-redesign-stat-icon appliance-redesign-stat-icon-green">
            W
          </div>

          <span>
            Combined rated power
          </span>

          <strong>
            {totalRatedPower.toFixed(
              0
            )}
            <small>
              W
            </small>
          </strong>

          <p>
            Based on appliance quantity.
          </p>
        </article>

        <article className="appliance-redesign-stat">
          <div className="appliance-redesign-stat-icon">
            ▤
          </div>

          <span>
            Current room
          </span>

          <strong>
            {selectedRoom
              ?.roomName ||
              "—"}
          </strong>

          <p>
            {selectedHousehold
              ?.householdName ||
              "No household selected"}
          </p>
        </article>
      </section>

      <section className="appliance-redesign-grid">
        <article className="appliance-redesign-form-card">
          <div className="appliance-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Appliance setup
              </p>

              <h2>
                {editingId
                  ? "Edit appliance"
                  : "Add appliance"}
              </h2>
            </div>

            <span className="appliance-redesign-form-icon">
              ⏻
            </span>
          </div>

          <form
            className="appliance-redesign-form"
            onSubmit={
              handleSubmit
            }
          >
            <section className="appliance-redesign-vision">
              <div className="appliance-redesign-vision-head">
                <div>
                  <div className="appliance-redesign-ai-label">
                    <span>
                      AI
                    </span>

                    Smart identification
                  </div>

                  <h3>
                    Identify from a photo
                  </h3>

                  <p>
                    Upload a clear image
                    or use your camera.
                    Visible appliance
                    details can be filled
                    automatically.
                  </p>
                </div>

                <span className="appliance-redesign-optional">
                  Optional
                </span>
              </div>

              <input
                ref={
                  uploadInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="appliance-redesign-hidden"
              />

              <input
                ref={
                  cameraInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={
                  handleImageChange
                }
                className="appliance-redesign-hidden"
              />

              <div className="appliance-redesign-photo-actions">
                <button
                  type="button"
                  className="appliance-redesign-upload"
                  onClick={() =>
                    uploadInputRef.current?.click()
                  }
                >
                  Upload photo
                </button>

                <button
                  type="button"
                  className="appliance-redesign-camera"
                  onClick={() =>
                    cameraInputRef.current?.click()
                  }
                >
                  Use camera
                </button>

                <button
                  type="button"
                  className="appliance-redesign-analyse"
                  onClick={
                    analyseSelectedImage
                  }
                  disabled={
                    !selectedImage ||
                    analysingImage
                  }
                >
                  <span>
                    AI
                  </span>

                  {analysingImage
                    ? "Analysing..."
                    : "Analyse image"}
                </button>
              </div>

              <small className="appliance-redesign-file-help">
                JPG, PNG or WEBP ·
                Maximum 10 MB
              </small>

              {imagePreview && (
                <div className="appliance-redesign-preview">
                  <div className="appliance-redesign-preview-image-wrap">
                    <img
                      src={
                        imagePreview
                      }
                      alt="Selected appliance"
                    />

                    <span>
                      Ready for analysis
                    </span>
                  </div>

                  <div className="appliance-redesign-preview-foot">
                    <span>
                      {
                        selectedImage?.name
                      }
                    </span>

                    <button
                      type="button"
                      onClick={
                        removeSelectedImage
                      }
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              )}

              {visionNotes && (
                <div className="appliance-redesign-ai-result">
                  <div className="appliance-redesign-ai-result-head">
                    <span>
                      AI
                    </span>

                    <strong>
                      Analysis complete
                    </strong>
                  </div>

                  <p>
                    {visionNotes}
                  </p>

                  <div className="appliance-redesign-ai-warning">
                    Please verify all
                    detected technical
                    details before saving.
                  </div>
                </div>
              )}

              {!imagePreview &&
                editingId &&
                formData.imagePath && (
                  <div className="appliance-redesign-existing-photo">
                    <span>
                      ✓
                    </span>

                    This appliance already
                    has a saved photo. Add
                    another photo only if
                    you want to replace it.
                  </div>
                )}
            </section>

            {formData.aiDetected && (
              <div className="appliance-redesign-detected">
                <span>
                  AI
                </span>

                <div>
                  <strong>
                    AI-assisted details
                  </strong>

                  <p>
                    Review and edit any
                    field below before
                    saving.
                  </p>
                </div>
              </div>
            )}

            <label>
              <span>
                Appliance name
              </span>

              <input
                type="text"
                name="applianceName"
                value={
                  formData.applianceName
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: Ceiling Fan"
              />
            </label>

            <label>
              <span>
                Category
              </span>

              <select
                name="categoryId"
                value={
                  formData.categoryId
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.categoryId
                      }
                      value={
                        category.categoryId
                      }
                    >
                      {categoryName(
                        category
                      )}
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="appliance-redesign-two-column">
              <label>
                <span>
                  Brand
                </span>

                <input
                  type="text"
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Singer"
                />
              </label>

              <label>
                <span>
                  Model
                </span>

                <input
                  type="text"
                  name="model"
                  value={
                    formData.model
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Model number"
                />
              </label>
            </div>

            <div className="appliance-redesign-two-column">
              <label>
                <span>
                  Rated power
                </span>

                <div className="appliance-redesign-unit-input">
                  <input
                    type="number"
                    name="ratedPower"
                    value={
                      formData.ratedPower
                    }
                    onChange={
                      handleChange
                    }
                    min="0.01"
                    step="0.01"
                    required
                    placeholder="75"
                  />

                  <span>
                    W
                  </span>
                </div>
              </label>

              <label>
                <span>
                  Voltage
                </span>

                <div className="appliance-redesign-unit-input">
                  <input
                    type="number"
                    name="voltage"
                    value={
                      formData.voltage
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    step="0.01"
                    placeholder="230"
                  />

                  <span>
                    V
                  </span>
                </div>
              </label>
            </div>

            <div className="appliance-redesign-two-column">
              <label>
                <span>
                  Quantity
                </span>

                <input
                  type="number"
                  name="quantity"
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                  step="1"
                  required
                />
              </label>

              <label>
                <span>
                  Energy rating
                </span>

                <input
                  type="text"
                  name="energyRating"
                  value={
                    formData.energyRating
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: A"
                />
              </label>
            </div>

            <div className="appliance-redesign-two-column">
              <label>
                <span>
                  Typical daily use
                </span>

                <div className="appliance-redesign-unit-input">
                  <input
                    type="number"
                    name="typicalDailyHours"
                    value={
                      formData.typicalDailyHours
                    }
                    onChange={
                      handleChange
                    }
                    min="0"
                    max="24"
                    step="0.1"
                    placeholder="6"
                  />

                  <span>
                    hrs
                  </span>
                </div>
              </label>

              <label>
                <span>
                  Status
                </span>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="INACTIVE">
                    Inactive
                  </option>
                </select>
              </label>
            </div>

            <div className="appliance-redesign-actions">
              <button
                type="submit"
                className="appliance-redesign-primary"
                disabled={
                  saving ||
                  uploadingImage ||
                  analysingImage
                }
              >
                {uploadingImage
                  ? "Uploading photo..."
                  : saving
                    ? "Saving..."
                    : editingId
                      ? "Update appliance"
                      : "Create appliance"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="appliance-redesign-secondary"
                  onClick={
                    resetForm
                  }
                  disabled={
                    saving ||
                    uploadingImage ||
                    analysingImage
                  }
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="appliance-redesign-list-card">
          <div className="appliance-redesign-card-head">
            <div>
              <p className="dashboard-kicker">
                Room appliances
              </p>

              <h2>
                Your appliances
              </h2>
            </div>

            <span className="appliance-redesign-count">
              {
                appliances.length
              }
            </span>
          </div>

          {!selectedRoomId ? (
            <div className="appliance-redesign-empty">
              Select a room to view
              appliances.
            </div>
          ) : loading ? (
            <div className="appliance-redesign-empty">
              Loading appliances...
            </div>
          ) : appliances.length ===
            0 ? (
            <div className="appliance-redesign-empty">
              <div className="appliance-redesign-empty-icon">
                ⏻
              </div>

              <strong>
                No appliances yet
              </strong>

              <span>
                Add an appliance manually
                or identify one from a
                photo.
              </span>
            </div>
          ) : (
            <div className="appliance-redesign-list">
              {appliances.map(
                (appliance) => (
                  <article
                    key={
                      appliance.applianceId
                    }
                    className="appliance-redesign-item"
                  >
                    <div className="appliance-redesign-item-top">
                      <div className="appliance-redesign-item-icon">
                        ⏻
                      </div>

                      <div className="appliance-redesign-item-title">
                        <div className="appliance-redesign-item-badges">
                          <span className="appliance-redesign-category">
                            {categoryName(
                              appliance.category
                            )}
                          </span>

                          {appliance.aiDetected && (
                            <span className="appliance-redesign-ai-badge">
                              AI identified
                            </span>
                          )}

                          <span
                            className={`appliance-redesign-status ${
                              appliance.status ===
                              "ACTIVE"
                                ? "appliance-redesign-status-active"
                                : "appliance-redesign-status-inactive"
                            }`}
                          >
                            {statusLabel(
                              appliance.status
                            )}
                          </span>
                        </div>

                        <h3>
                          {
                            appliance.applianceName
                          }
                        </h3>

                        {(appliance.brand ||
                          appliance.model) && (
                          <p>
                            {appliance.brand ||
                              "Unknown brand"}

                            {appliance.model
                              ? ` · ${appliance.model}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="appliance-redesign-item-values">
                      <div>
                        <span>
                          Rated power
                        </span>

                        <strong>
                          {
                            appliance.ratedPower
                          }{" "}
                          W
                        </strong>
                      </div>

                      <div>
                        <span>
                          Voltage
                        </span>

                        <strong>
                          {appliance.voltage !==
                            null &&
                          appliance.voltage !==
                            undefined
                            ? `${appliance.voltage} V`
                            : "—"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Quantity
                        </span>

                        <strong>
                          {
                            appliance.quantity
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Daily use
                        </span>

                        <strong>
                          {appliance.typicalDailyHours ??
                            0}{" "}
                          hrs
                        </strong>
                      </div>
                    </div>

                    <div className="appliance-redesign-item-meta">
                      <span>
                        Energy rating
                      </span>

                      <strong>
                        {appliance.energyRating ||
                          "Not specified"}
                      </strong>

                      <span>
                        Photo
                      </span>

                      <strong>
                        {appliance.imagePath
                          ? "Saved"
                          : "Not added"}
                      </strong>

                      <span>
                        ID
                      </span>

                      <strong>
                        #
                        {
                          appliance.applianceId
                        }
                      </strong>
                    </div>

                    <div className="appliance-redesign-item-actions">
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            appliance
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="appliance-redesign-delete"
                        onClick={() =>
                          handleDelete(
                            appliance.applianceId
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