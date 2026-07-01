const units = {
	// Length, base: meter
	m: { name: "Meters", type: "length", factor: 1 },
	km: { name: "Kilometers", type: "length", factor: 1000 },
	cm: { name: "Centimeters", type: "length", factor: 0.01 },
	mm: { name: "Millimeters", type: "length", factor: 0.001 },
	mi: { name: "Miles", type: "length", factor: 1609.344 },
	yd: { name: "Yards", type: "length", factor: 0.9144 },
	ft: { name: "Feet", type: "length", factor: 0.3048 },
	in: { name: "Inches", type: "length", factor: 0.0254 },
    ac: { name: "Acres", type: "length", factor: 4046.8564224 },
    ha: { name: "Hectares", type: "length", factor: 10000 },

	// Weight, base: gram
	g: { name: "Grams", type: "weight", factor: 1 },
	kg: { name: "Kilograms", type: "weight", factor: 1000 },
	mg: { name: "Milligrams", type: "weight", factor: 0.001 },
	lb: { name: "Pounds", type: "weight", factor: 453.59237 },
	oz: { name: "Ounces", type: "weight", factor: 28.349523125 },
    bu: { name: "Bushels", type: "weight", factor: 35239.2 },

	// Temperature, handled separately
	c: { name: "Celsius", type: "temperature" },
	f: { name: "Fahrenheit", type: "temperature" },
	k: { name: "Kelvin", type: "temperature" },
};

function convertTemperature(value, from, to) {
    let celsius;

    if (from === "c") celsius = value;
    if (from === "f") celsius = (value - 32) * 5 / 9;
    if (from === "k") celsius = value - 273.15;

    if (to === "c") return celsius;
    if (to === "f") return celsius * 9 / 5 + 32;
    if (to === "k") return celsius + 273.15;
}

function convertUnit(value, from, to) {
    const fromUnit = units[from];
    const toUnit = units[to];

    if (!fromUnit || !toUnit) {
        throw new Error("Invalid unit.");
    }

    if (fromUnit.type !== toUnit.type) {
        throw new Error("You cannot convert between different unit types.");
    }

    if (fromUnit.type === "temperature") {
        return convertTemperature(value, from, to);
    }

    const baseValue = value * fromUnit.factor;
    return baseValue / toUnit.factor;
}

module.exports = {
    convertUnit,
    convertTemperature,
}
