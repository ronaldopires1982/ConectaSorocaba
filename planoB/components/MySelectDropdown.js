import { useEffect, useState, useMemo, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  Colors,
  LeftIcon,
  StyledInputLabel,
  StyledSelectDropdownButton,
  StyledSelectDropdownButtonText,
  StyledSelectDropdownMenu,
} from "../src/Componentes/estilos";
import IconComponent from "./IconComponent";
import { buscaUF, buscaCidadesPorUF } from "../src/api/UserService";
import { SignUpContext } from "../hooks/SignUpContext";

const { brand, darklight } = Colors;

export const MyUFSelectDropdown = ({
  label,
  onSelect,
  defaultValue,
  icon,
  iconFamily,
  menuWidth,
  disabled,
}) => {
  const [ufs, setUfs] = useState([]);

  useEffect(() => {
    (async function () {
      setUfs(await buscaUF());
      // console.log(ufs);
    })();
  }, []);

  return (
    <SelectDropdown
      data={ufs}
      onSelect={(selectedItem) => {
        onSelect(selectedItem.id);
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View>
            {icon && iconFamily && (
              <LeftIcon>
                <IconComponent
                  name={icon}
                  iconFamily={iconFamily}
                  size={26}
                  color={brand}
                />
              </LeftIcon>
            )}
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledSelectDropdownButton>
              <StyledSelectDropdownButtonText
                style={[{ paddingLeft: icon && iconFamily ? 40 : 0 }]}
                editable={!disabled}
              >
                {selectedItem ? selectedItem.id : defaultValue}
              </StyledSelectDropdownButtonText>
              <Icon
                name={isOpened ? "chevron-up" : "chevron-down"}
                style={{ fontSize: 28 }}
              />
            </StyledSelectDropdownButton>
          </View>
        );
      }}
      renderItem={(item, isSelected) => {
        return (
          <View
            style={{
              ...styles.dropdownItemStyle,
              ...(isSelected && {
                backgroundColor: darklight,
              }),
            }}
          >
            <Text style={styles.dropdownTxtStyle}>
              {item.id} - {item.text}
            </Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={true}
      dropdownStyle={{ ...StyledSelectDropdownMenu, width: menuWidth }}
    />
  );
};

// export default MyUFSelectDropdown;

export const MyCitySelectDropdown = ({
  ufEscolhido,
  label,
  onSelect,
  defaultValue,
  icon,
  iconFamily,
  menuWidth,
  disabled,
}) => {
  const [cidades, setCidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { formData, updateFormData } = useContext(SignUpContext);
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const fetchCidades = async () => {
      if (ufEscolhido) {
        setIsLoading(true);
        try {
          const fetchedCidades = await buscaCidadesPorUF(ufEscolhido);
          setCidades(fetchedCidades);
          // console.log(selectedCity);
          // setSelectedCity(null);
        } catch (error) {
          console.error("erro ao buscar cidades", error);
          setCidades([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCidades();
  }, [ufEscolhido]);

  const renderButton = useMemo(() => {
    return (selectedItem, isOpened) => (
      <View>
        {icon && iconFamily && (
          <LeftIcon>
            <IconComponent
              name={icon}
              iconFamily={iconFamily}
              size={26}
              color={brand}
            />
          </LeftIcon>
        )}
        <StyledInputLabel>{label}</StyledInputLabel>
        <StyledSelectDropdownButton>
          <StyledSelectDropdownButtonText
            style={[{ paddingLeft: icon && iconFamily ? 40 : 0 }]}
            editable={!disabled}
          >
            {selectedItem ? selectedItem.text : defaultValue}
          </StyledSelectDropdownButtonText>
          <Icon
            name={isOpened ? "chevron-up" : "chevron-down"}
            style={{ fontSize: 28 }}
          />
        </StyledSelectDropdownButton>
      </View>
    );
  }, [defaultValue, icon, iconFamily, disabled]);

  return (
    <SelectDropdown
      data={cidades}
      disabled={isLoading || disabled}
      onSelect={(selectedItem) => {
        onSelect(selectedItem.id);
        updateFormData({ cidade: selectedItem.text });
        console.log("cidade selecionada:", selectedItem.text);
        // setSelectedCity(selectedItem);
        // console.log(selectedCity, "fdfefe");
      }}
      renderButton={renderButton}
      renderItem={(item, isSelected) => {
        return (
          <View
            style={{
              ...styles.dropdownItemStyle,
              ...(isSelected && {
                backgroundColor: darklight,
              }),
            }}
          >
            <Text style={styles.dropdownTxtStyle}>{item.text}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={true}
      dropdownStyle={{ ...StyledSelectDropdownMenu, width: menuWidth }}
      search={true}
      searchPlaceHolder="Procurar cidade"
      searchInputStyle={styles.dropdownSearchInputStyle}
      searchInputTxtColor="#151E26"
      searchInputBgColor="white"
    />
  );
};

const styles = StyleSheet.create({
  dropdownItemStyle: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "left",
    height: 50, // altura de cada item (6 para cada)
  },
  dropdownTxtStyle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
});
