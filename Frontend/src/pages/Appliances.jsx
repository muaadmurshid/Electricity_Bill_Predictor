import {
  useEffect,
  useRef,
  useState,
} from "react";

import householdService from "../services/householdService";
import roomService from "../services/roomService";
import applianceService from "../services/applianceService";
import applianceCategoryService from "../services/applianceCategoryService";
import applianceVisionService from "../services/applianceVisionService";

export default function Appliances() {
  const [households, setHouseholds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [appliances, setAppliances] = useState([]);

  const [selectedHouseholdId, setSelectedHouseholdId] =
    useState("");

  const [selectedRoomId, setSelectedRoomId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [analysingImage, setAnalysingImage] =
    useState(false);

  const [visionNotes, setVisionNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const uploadInputRef =
    useRef(null);

  const cameraInputRef =
    useRef(null);

  const [formData, setFormData] = useState({
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
        householdList.length > 0
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
        await roomService
          .listByHousehold(
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
        await applianceService
          .listByRoom(
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
  }

  function handleRoomChange(
    event
  ) {
    setSelectedRoomId(
      event.target.value
    );

    resetForm();
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
      event.target
        .files?.[0];

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
    setVisionNotes("");

    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(
      file
    );

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setImagePreview(
      previewUrl
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
      setVisionNotes("");

      const result =
        await applianceVisionService
          .analyse(
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
              const categoryName =
                (
                  category.categoryName ||
                  category.name ||
                  ""
                )
                  .trim()
                  .toLowerCase();

              return (
                categoryName ===
                  aiCategory ||
                categoryName.includes(
                  aiCategory
                ) ||
                aiCategory.includes(
                  categoryName
                )
              );
            }
          );

        if (
          matchedCategory
        ) {
          matchedCategoryId =
            String(
              matchedCategory
                .categoryId
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

      if (
        result?.notes
      ) {
        setVisionNotes(
          result.notes
        );
      } else {
        setVisionNotes(
          "AI analysis completed. Please review the detected appliance details before saving."
        );
      }
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
      !formData
        .applianceName
        .trim()
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
      formData
        .typicalDailyHours !== "" &&
      (
        Number(
          formData
            .typicalDailyHours
        ) < 0 ||
        Number(
          formData
            .typicalDailyHours
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
            formData
              .categoryId
          ),
      },

      applianceName:
        formData
          .applianceName
          .trim(),

      brand:
        formData
          .brand
          .trim(),

      model:
        formData
          .model
          .trim(),

      ratedPower:
        Number(
          formData
            .ratedPower
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
        formData
          .energyRating
          .trim(),

      typicalDailyHours:
        formData
          .typicalDailyHours === ""
          ? 0
          : Number(
              formData
                .typicalDailyHours
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
          await applianceService
            .update(
              editingId,
              payload
            );
      } else {
        savedAppliance =
          await applianceService
            .create(
              payload
            );
      }

      if (
        selectedImage &&
        savedAppliance
          ?.applianceId
      ) {
        try {
          setUploadingImage(
            true
          );

          await applianceService
            .uploadImage(
              savedAppliance
                .applianceId,
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
            imageError
              ?.response
              ?.data
              ?.error ||
              imageError
                ?.response
                ?.data
                ?.message ||
              "The appliance was saved, but its photo could not be uploaded."
          );

          await loadAppliances(
            selectedRoomId
          );

          return;
        }
      }

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
      appliance.room
        ?.roomId
    ) {
      setSelectedRoomId(
        String(
          appliance.room
            .roomId
        )
      );
    }

    setFormData({
      applianceName:
        appliance
          .applianceName ||
        "",

      categoryId:
        appliance.category
          ?.categoryId !==
          undefined &&
        appliance.category
          ?.categoryId !==
          null
          ? String(
              appliance
                .category
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
        appliance
          .ratedPower !==
          undefined &&
        appliance
          .ratedPower !==
          null
          ? String(
              appliance
                .ratedPower
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
        appliance
          .energyRating ||
        "",

      typicalDailyHours:
        appliance
          .typicalDailyHours !==
          undefined &&
        appliance
          .typicalDailyHours !==
          null
          ? String(
              appliance
                .typicalDailyHours
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

      await applianceService
        .remove(
          applianceId
        );

      if (
        editingId ===
        applianceId
      ) {
        resetForm();
      }

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

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          MY HOME
        </p>

        <h1 style={styles.title}>
          Appliances
        </h1>

        <p style={styles.lead}>
          Add the appliances used in each room.
          Their power, quantity and daily use are
          used when analysing household electricity
          consumption.
        </p>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <section style={styles.selectorCard}>
        <div style={styles.selectorGrid}>
          <div>
            <label style={styles.label}>
              Household
            </label>

            <select
              value={selectedHouseholdId}
              onChange={
                handleHouseholdChange
              }
              style={styles.input}
            >
              <option value="">
                Select household
              </option>

              {households.map(
                (household) => (
                  <option
                    key={
                      household
                        .householdId
                    }
                    value={
                      household
                        .householdId
                    }
                  >
                    {
                      household
                        .householdName
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Room
            </label>

            <select
              value={selectedRoomId}
              onChange={
                handleRoomChange
              }
              style={styles.input}
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
          </div>
        </div>
      </section>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {editingId
              ? "Edit appliance"
              : "Add appliance"}
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div style={styles.photoSection}>
              <div style={styles.photoHeader}>
                <div>
                  <label style={styles.label}>
                    Appliance photo
                  </label>

                  <p style={styles.photoHelp}>
                    Upload a clear photo or use your
                    camera. AI can analyse the image and
                    fill the appliance details for you.
                  </p>
                </div>

                <span style={styles.optionalBadge}>
                  Optional
                </span>
              </div>

              <input
                ref={uploadInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                style={styles.hiddenInput}
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={
                  handleImageChange
                }
                style={styles.hiddenInput}
              />

              <div style={styles.photoActions}>
                <button
                  type="button"
                  style={styles.uploadButton}
                  onClick={() =>
                    uploadInputRef
                      .current
                      ?.click()
                  }
                >
                  Upload photo
                </button>

                <button
                  type="button"
                  style={styles.cameraButton}
                  onClick={() =>
                    cameraInputRef
                      .current
                      ?.click()
                  }
                >
                  Use camera
                </button>

                <button
                  type="button"
                  style={styles.aiAnalyseButton}
                  onClick={
                    analyseSelectedImage
                  }
                  disabled={
                    !selectedImage ||
                    analysingImage
                  }
                >
                  {analysingImage
                    ? "Analysing..."
                    : "Analyse with AI"}
                </button>
              </div>

              <p style={styles.fileHelp}>
                JPG, PNG or WEBP • Maximum 10 MB
              </p>

              {imagePreview && (
                <div style={styles.previewWrap}>
                  <img
                    src={imagePreview}
                    alt="Selected appliance"
                    style={styles.previewImage}
                  />

                  <div style={styles.previewFooter}>
                    <span style={styles.previewName}>
                      {selectedImage?.name}
                    </span>

                    <button
                      type="button"
                      onClick={
                        removeSelectedImage
                      }
                      style={styles.removePhotoButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {visionNotes && (
                <div style={styles.aiResult}>
                  <strong>
                    AI analysis
                  </strong>

                  <p style={styles.aiResultText}>
                    {visionNotes}
                  </p>

                  <p style={styles.aiWarning}>
                    Please verify all detected technical details before saving.
                  </p>
                </div>
              )}

              {!imagePreview &&
                editingId &&
                formData.imagePath && (
                  <div style={styles.existingImageNote}>
                    This appliance already has a saved
                    photo. Select a new photo only if you
                    want to replace it.
                  </div>
                )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Appliance name
              </label>

              <input
                type="text"
                name="applianceName"
                value={
                  formData
                    .applianceName
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Example: Ceiling Fan"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Category
              </label>

              <select
                name="categoryId"
                value={
                  formData
                    .categoryId
                }
                onChange={
                  handleChange
                }
                required
                style={styles.input}
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category
                          .categoryId
                      }
                      value={
                        category
                          .categoryId
                      }
                    >
                      {category
                        .categoryName ||
                        category.name ||
                        `Category ${category.categoryId}`}
                    </option>
                  )
                )}
              </select>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Brand
                </label>

                <input
                  type="text"
                  name="brand"
                  value={
                    formData.brand
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: Panasonic"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Model
                </label>

                <input
                  type="text"
                  name="model"
                  value={
                    formData.model
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: CS-XU12ZKH"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Rated power (W)
                </label>

                <input
                  type="number"
                  name="ratedPower"
                  value={
                    formData
                      .ratedPower
                  }
                  onChange={
                    handleChange
                  }
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Example: 75"
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Voltage (V)
                </label>

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
                  placeholder="Example: 230"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.twoColumn}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Quantity
                </label>

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
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Energy rating
                </label>

                <input
                  type="text"
                  name="energyRating"
                  value={
                    formData
                      .energyRating
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Example: A"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Typical daily hours
              </label>

              <input
                type="number"
                name="typicalDailyHours"
                value={
                  formData
                    .typicalDailyHours
                }
                onChange={
                  handleChange
                }
                min="0"
                max="24"
                step="0.1"
                placeholder="Example: 6"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                style={styles.input}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>
              </select>
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                style={styles.primaryButton}
                disabled={
                  saving ||
                  uploadingImage ||
                  analysingImage
                }
              >
                {saving ||
                uploadingImage
                  ? uploadingImage
                    ? "Uploading photo..."
                    : "Saving..."
                  : editingId
                    ? "Update appliance"
                    : "Create appliance"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  style={
                    styles.secondaryButton
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
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Appliances
          </h2>

          {!selectedRoomId ? (
            <p style={styles.muted}>
              Select a room to view appliances.
            </p>
          ) : loading ? (
            <p style={styles.muted}>
              Loading appliances...
            </p>
          ) : appliances.length ===
            0 ? (
            <p style={styles.muted}>
              No appliances found in this room.
            </p>
          ) : (
            <div style={styles.list}>
              {appliances.map(
                (appliance) => (
                  <div
                    key={
                      appliance
                        .applianceId
                    }
                    style={
                      styles.applianceItem
                    }
                  >
                    <div style={styles.applianceInfo}>
                      <div style={styles.applianceTitleRow}>
                        <h3 style={styles.applianceName}>
                          {
                            appliance
                              .applianceName
                          }
                        </h3>

                        {appliance.aiDetected && (
                          <span style={styles.aiBadge}>
                            AI identified
                          </span>
                        )}
                      </div>

                      <p style={styles.detail}>
                        <strong>
                          Category:
                        </strong>{" "}
                        {appliance.category
                          ?.categoryName ||
                          appliance.category
                            ?.name ||
                          "—"}
                      </p>

                      {(appliance.brand ||
                        appliance.model) && (
                        <p style={styles.detail}>
                          <strong>
                            Brand / Model:
                          </strong>{" "}
                          {appliance.brand ||
                            "—"}
                          {" / "}
                          {appliance.model ||
                            "—"}
                        </p>
                      )}

                      <p style={styles.detail}>
                        <strong>
                          Power:
                        </strong>{" "}
                        {
                          appliance
                            .ratedPower
                        }{" "}
                        W
                      </p>

                      {appliance.voltage !==
                        null &&
                        appliance.voltage !==
                          undefined && (
                          <p style={styles.detail}>
                            <strong>
                              Voltage:
                            </strong>{" "}
                            {
                              appliance
                                .voltage
                            }{" "}
                            V
                          </p>
                        )}

                      <p style={styles.detail}>
                        <strong>
                          Quantity:
                        </strong>{" "}
                        {
                          appliance
                            .quantity
                        }
                      </p>

                      <p style={styles.detail}>
                        <strong>
                          Typical daily use:
                        </strong>{" "}
                        {appliance
                          .typicalDailyHours ??
                          0}{" "}
                        hours
                      </p>

                      {appliance.energyRating && (
                        <p style={styles.detail}>
                          <strong>
                            Energy rating:
                          </strong>{" "}
                          {
                            appliance
                              .energyRating
                          }
                        </p>
                      )}

                      <p style={styles.detail}>
                        <strong>
                          Photo:
                        </strong>{" "}
                        {appliance.imagePath
                          ? "Saved"
                          : "Not added"}
                      </p>

                      <p style={styles.detail}>
                        <strong>
                          Status:
                        </strong>{" "}
                        {
                          appliance.status
                        }
                      </p>

                      <p style={styles.detail}>
                        <strong>
                          Appliance ID:
                        </strong>{" "}
                        {
                          appliance
                            .applianceId
                        }
                      </p>
                    </div>

                    <div style={styles.itemActions}>
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            appliance
                          )
                        }
                        style={
                          styles.editButton
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            appliance
                              .applianceId
                          )
                        }
                        style={
                          styles.deleteButton
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "24px",
  },

  eyebrow: {
    fontSize: "12px",
    letterSpacing: "0.14em",
    marginBottom: "8px",
    color: "#7a5c5c",
  },

  title: {
    fontSize: "34px",
    margin: "0 0 10px 0",
  },

  lead: {
    maxWidth: "760px",
    lineHeight: 1.6,
    color: "#765f5f",
  },

  error: {
    padding: "14px 16px",
    marginBottom: "20px",
    border:
      "1px solid #e5b4b4",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#9a1f1f",
  },

  selectorCard: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "22px",
  },

  selectorGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border:
      "1px solid #e6dcdc",
    borderRadius: "14px",
    padding: "24px",
    boxShadow:
      "0 2px 8px rgba(0, 0, 0, 0.04)",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
  },

  field: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    fontWeight: 600,
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border:
      "1px solid #d8caca",
    borderRadius: "8px",
    fontSize: "15px",
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  },

  photoSection: {
    marginBottom: "22px",
    padding: "18px",
    border:
      "1px solid #e5d8d8",
    borderRadius: "12px",
    background: "#fffafa",
  },

  photoHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "14px",
  },

  photoHelp: {
    margin:
      "4px 0 0 0",
    color: "#806d6d",
    lineHeight: 1.5,
    fontSize: "14px",
  },

  optionalBadge: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#f0e5e5",
    color: "#6f5656",
    fontSize: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  hiddenInput: {
    display: "none",
  },

  photoActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "16px",
  },

  uploadButton: {
    padding: "10px 16px",
    border:
      "1px solid #7f0000",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#7f0000",
    fontWeight: 600,
    cursor: "pointer",
  },

  cameraButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#7f0000",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  aiAnalyseButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#8b6b18",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  fileHelp: {
    margin:
      "10px 0 0 0",
    fontSize: "12px",
    color: "#8c7777",
  },

  previewWrap: {
    marginTop: "16px",
    border:
      "1px solid #e6dcdc",
    borderRadius: "10px",
    padding: "10px",
    background: "#ffffff",
  },

  previewImage: {
    display: "block",
    width: "100%",
    maxHeight: "280px",
    objectFit: "contain",
    borderRadius: "8px",
    background: "#f7f2f2",
  },

  previewFooter: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "10px",
  },

  previewName: {
    color: "#665555",
    fontSize: "13px",
    overflow: "hidden",
    textOverflow:
      "ellipsis",
    whiteSpace: "nowrap",
  },

  removePhotoButton: {
    padding: "7px 11px",
    border:
      "1px solid #c6aaaa",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#8b2424",
    cursor: "pointer",
  },

  existingImageNote: {
    marginTop: "14px",
    padding: "11px 12px",
    borderRadius: "8px",
    background: "#f5eeee",
    color: "#6d5656",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  aiResult: {
    marginTop: "14px",
    padding: "13px 14px",
    border:
      "1px solid #dfcf9f",
    borderRadius: "9px",
    background: "#fff9e8",
    color: "#5f4a17",
  },

  aiResultText: {
    margin: "7px 0",
    lineHeight: 1.5,
  },

  aiWarning: {
    margin: 0,
    fontSize: "12px",
    color: "#806621",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#7f0000",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "11px 18px",
    border:
      "1px solid #cbbbbb",
    borderRadius: "8px",
    background: "#ffffff",
    cursor: "pointer",
  },

  list: {
    display: "flex",
    flexDirection:
      "column",
    gap: "14px",
  },

  applianceItem: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding: "18px",
    border:
      "1px solid #eadede",
    borderRadius: "10px",
    background: "#fffafa",
  },

  applianceInfo: {
    minWidth: 0,
    flex: 1,
  },

  applianceTitleRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "12px",
  },

  applianceName: {
    margin: 0,
  },

  aiBadge: {
    padding: "4px 8px",
    borderRadius: "999px",
    background: "#eee5cf",
    color: "#725817",
    fontSize: "11px",
    fontWeight: 700,
  },

  detail: {
    margin: "6px 0",
    color: "#5f5050",
  },

  itemActions: {
    display: "flex",
    flexDirection:
      "column",
    gap: "8px",
  },

  editButton: {
    padding: "8px 14px",
    border:
      "1px solid #a88",
    borderRadius: "7px",
    background: "#ffffff",
    cursor: "pointer",
  },

  deleteButton: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "7px",
    background: "#a22323",
    color: "#ffffff",
    cursor: "pointer",
  },

  muted: {
    color: "#806d6d",
  },
};