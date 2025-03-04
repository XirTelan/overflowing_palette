import { MenuTab } from "./MenuTab";
import { MenuTabProps } from "../../types";

export class LevelSelection extends MenuTab {
  constructor(props: MenuTabProps) {
    super(props);
    const { scene, width, height } = props;
  }
}
